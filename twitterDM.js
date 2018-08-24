const security = require('libdm/security');
const twitter = require('libdm/twitter');
const generator = require('./generator');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDB = new AWS.DynamoDB.DocumentClient();

var unixTimeInSec = function() {
  return Math.round((new Date()).getTime()/1000);
};

var isEmpty = function(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
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

  console.log(event);
  let inBody = JSON.parse(event.body);

  var calls = inBody.direct_message_events.forEach(function(item) {

    let getParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: Number(item.id),
      },
    };

    dynamoDB.get(getParams, (error, result) => {
      // handle potential errors
      if (error) {
        console.error(error);
        callback(null, error);
      } else if (isEmpty(result)) {
          let putParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
              id: Number(item.id),
              ttl: Math.floor(Date.now() / 1000)+3600
            }
          };
          dynamoDB.put(putParams, (error) => {
            // handle potential errors
            if (error) {
              console.error(error);
              callback(null, error);
            } else if (item.message_create.message_data.text.toLowerCase().includes('redrum')) {
                let outBody =
                {
                  "event": {
                    "type": "message_create",
                    "message_create": {
                      "target": {
                        "recipient_id": item.message_create.sender_id
                      },
                      "message_data": {
                        "text": generator.generate(unixTimeInSec()),
                      }
                    }
                  }
                };
                console.log(outBody);
                twitter.send_direct_message(outBody, function(error, response, body) {
                  if (error) {
                    console.log(error);
                    console.log(body.error);
                  }
                  console.log(response);
                });
              }
          });
        }
    });
  });


  Promise.all(calls).then( () => {
    callback(null,OKresponse);
  })
  .catch((err) => {
    console.log(err);
    callback(null,OKresponse);
  });

};
