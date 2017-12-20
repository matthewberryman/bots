const security = require('libdm/security');
const twitter = require('libdm/twitter');
const generator = require('./generator');

var unixTimeInSec = function() {
  return Math.round((new Date()).getTime()/1000);
};

module.exports.get = function(event, context, callback) {

  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!');
    return callback(null, 'Lambda is warm!');
  }

  console.log(event); // Contains incoming request data (e.g., query params, headers and more)

  var crc_token = event.queryStringParameters.crc_token;

  if (crc_token) {
    var hash = security.get_challenge_response(crc_token, process.env.TWITTER_CONSUMER_SECRET);

    const OKresponse = {
      statusCode: 200,
      body: JSON.stringify({"response_token": "sha256="+hash})
    };

    callback(null, OKresponse);

  } else {

    const ERRORresponse = {
      statusCode: 400,
      body: 'Error: crc_token missing from request.'
    };

    callback(null, ERRORresponse);
  }
};

module.exports.post = function(event, context, callback) {

  const OKresponse = {
    statusCode: 200,
    body: 'Ok'
  };

  const inBody = JSON.parse(event.body);

  var calls = inBody.direct_message_events.map(function callback(item) {
    if (item.message_create.message_data.text.toLowerCase().includes('redrum')) {
      const outBody =
      {
        "event": {
          "type": "message_create",
          "message_create": {
            "target": {
              "recipient_id": inBody.direct_message_events[i].message_create.target.recipient_id
            },
            "message_data": {
              "text": generator.generate(unixTimeInSec()),
            }
          }
        }
      };
      twitter.send_direct_message(outBody, function(error, response, body) {
        if (error) {
          console.log(error);
          console.log(body.error);
        }
      });
    }
  });

  Promise.all(calls).then( () => {
    callback(null,OKresponse);
  })
  .catch(err => {
    console.log(err);
    callback(null,OKresponse);
  });

};
