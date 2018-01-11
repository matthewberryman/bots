const AWS = require('aws-sdk'),
  Twitter = require('twitter'),
  FB = require('fb'),
  text2png = require('text2png'),
  generator = require('./generator');

AWS.config.update({region: 'us-east-1'});

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

FB.setAccessToken(process.env.FACEBOOK_ACCESS_TOKEN);

const pngopt = {
  font: '14px Futura',
  textColor: 'teal',
  bgColor: 'linen',
  lineSpacing: 8,
  padding: 25
};


var truncate = function(string) {
   if (string.length > 280) {
     return string.substring(0,string.lastIndexOf(' ',277))+'...';
   }

   return string;
};

// stringWrap function from http://stackoverflow.com/posts/14502311/revisions
var stringWrap = function (str, width, spaceReplacer) {
    if (str.length>width) {
        let p=width;
        for (;p>0 && str[p]!=' '; p--) {
          // eslint-disable-line no-empty
        }
        if (p>0) {
            let left = str.substring(0, p);
            let right = str.substring(p+1);

            return left + spaceReplacer + stringWrap(right, width, spaceReplacer);
        }
    }

    return str;
};

var post = function(text) {
  FB.api(process.env.FACEBOOK_PAGE_ID+'/feed', 'post', { message: text,
    function (res) {
      if(!res || res.error) { // eslint-disable-line no-negated-condition
        console.log(!res ? 'FB error occurred' : res.error); // eslint-disable-line no-negated-condition
      } else {
        console.log('FB Post Id: ' + res.id);
      }
  }});

  if (text.length>280) {
    client.post('media/upload', {media: text2png(stringWrap(text,40,'\n'), pngopt)}, function(error, media, response) {
      console.log(response);
      if (!error) {
        var status = {
          status: truncate(text) ,
          media_ids: media.media_id_string // Pass the media id string
        };
        client.post('statuses/update', status, function(error, tweet, response) {
          console.log(response);
          if (!error) {
            console.log(tweet);
          }
        });
      }
    });
  } else {
    var status = {
      status: text
    };
    client.post('statuses/update', status, function(error, tweet, response) {
      if (!error) {
        console.log(tweet);
      }
      console.log(response);
    });
  }
};

var unixTimeInSec = function() {
  return Math.round((new Date()).getTime()/1000);
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
    var SQSseed = Number(data.Messages[0].MessageAttributes.seed.StringValue);
    var seed = SQSseed < 0 ? SQSseed + unixTimeInSec()
      : SQSseed - unixTimeInSec();
    var params = {
      QueueUrl: process.env.SQS_QUEUE_URL, /* required */
      ReceiptHandle: data.Messages[0].ReceiptHandle
    };
    sqs.deleteMessage(params).promise().then(function(data) {
      post(generator.generate(seed));
      console.log(data);
    })
    .catch(function(err) {
      post(generator.generate(unixTimeInSec()));
      console.log(err);
    });
  }).catch(function(err) {
    post(generator.generate(unixTimeInSec()));
    console.log(err);
  });
  callback(null, { message: 'Bot tweeted successfully!', event });
};
