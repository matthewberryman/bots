const security = require('libdm/security');
const twitter = require('libdm/twitter');
const generator = require('./generator');

var unixTimeInSec = function() {
  return Math.round((new Date()).getTime()/1000);
};

module.exports.get = function(event, context, callback) {

  console.log(event); // Contains incoming request data (e.g., query params, headers and more)

  var crc_token = event.queryStringParameters.crc_token;

  if (crc_token) {
    var hash = security.get_challenge_response(crc_token, process.env.TWITTER_CONSUMER_SECRET);

    const response = {
      statusCode: 200,
      body: JSON.stringify({"response_token":"sha256="+hash})
    };

    callback(null, response);

  } else {

    const response = {
      statusCode: 400,
      body: 'Error: crc_token missing from request.'
    };

    callback(null, response);
  }
};

module.exports.post = function(event, context, callback) {

  const response = {
    statusCode: 200,
    body: 'Ok'
  };

  const inBody = JSON.parse(event.body);
  var responses = inBody.direct_message_events.length, sent = 0;
  for (var i = 0; i < inBody.direct_message_events.length; i++) {
    if (inBody.direct_message_events[i].message_create.message_data.text.includes('plot')) {
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

      twitter.send_direct_message(body,function(error, response, body) {
        sent++;
        if(sent==responses) {
          callback(null,response);
        }
      });
    } else {
      sent++;
      if(sent==responses) {
        callback(null,response);
      }
    }
  }
}
