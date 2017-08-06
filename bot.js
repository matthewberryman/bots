const AWS = require('aws-sdk'),
  Twitter = require('twitter'),
  text2png = require('text2png'),
  generator = require('./generator');

AWS.config.update({region: 'us-east-1'});

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const pngopt = {
  font: '14px Futura',
  textColor: 'teal',
  bgColor: 'linen',
  lineSpacing: 8,
  padding: 25
};


var truncate = function(string) {
   if (string.length > 140)
      return string.substring(0,string.lastIndexOf(' ',137))+'...';
   else
      return string;
};

// stringWrap function from http://stackoverflow.com/posts/14502311/revisions
var stringWrap = function (str, width, spaceReplacer) {
    if (str.length>width) {
        var p=width;
        for (;p>0 && str[p]!=' ';p--) {
        }
        if (p>0) {
            var left = str.substring(0, p);
            var right = str.substring(p+1);
            return left + spaceReplacer + stringWrap(right, width, spaceReplacer);
        }
    }
    return str;
};

module.exports.tweet = (event, context, callback) => {

  var sqs = new AWS.SQS();
  var params = {
    QueueUrl: process.env.SQS_QUEUE_URL, /* required */
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
      "seed",
      /* more items */
    ],
    VisibilityTimeout: 5
  };

  sqs.receiveMessage(params).promise().then(function(data) {
    var text = generate.generate(Number(data.Messages[0].MessageAttributes.seed.StringValue));
    var params = {
      QueueUrl: process.env.SQS_QUEUE_URL, /* required */
      ReceiptHandle: data.Messages[0].ReceiptHandle
    };
    sqs.deleteMessage(params).promise().then(function(data) {
      client.post('media/upload', {media: text2png(stringWrap(text,40,'\n'), pngopt)}, function(error, media, response) {
        if (!error) {
          var status = {
            status: truncate(text) ,
            media_ids: media.media_id_string // Pass the media id string
          };
          client.post('statuses/update', status, function(error, tweet, response) {
            if (!error) {
              console.log(tweet);
            }
          });
        }
      });
    }).catch(function(err) {
      console.log(err);
    });
  }).catch(function(err) {
    console.log(err);
  });
  callback(null, { message: 'Bot tweeted successfully!', event });
};
