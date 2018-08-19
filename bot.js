const AWS = require('aws-sdk'),
  Twitter = require('twitter'),
  Mastodon = require('megalodon'),
  FB = require('fb'),
  text2png = require('text2png'),
  generator = require('./generator');

const secretsmanager = new AWS.SecretsManager();

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

var post = function(text, FBpageId, TwitterClient, MastodonClient) {
  FB.api(FBpageId+'/feed', 'post', { message: text,
    function (res) {
      if(!res || res.error) { // eslint-disable-line no-negated-condition
        console.log(!res ? 'FB error occurred' : res.error); // eslint-disable-line no-negated-condition
      } else {
        console.log('FB Post Id: ' + res.id);
      }
  }});

  MastodonClient.post('/statuses', {
      status: text,
      spoiler_text: '#murderplot'
    }).then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });

  if (text.length>280) {
    TwitterClient.post('media/upload', {media: text2png(stringWrap(text,40,'\n'), pngopt)}, function(error, media, response) {
      console.log(response);
      if (!error) {
        var status = {
          status: truncate(text) ,
          media_ids: media.media_id_string // Pass the media id string
        };
        TwitterClient.post('statuses/update', status, function(error, tweet, response) {
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
    TwitterClient.post('statuses/update', status, function(error, tweet, response) {
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

module.exports.tweet = async (event, context, callback) => {

  try {
    let data = await secretsmanager.getSecretValue({'SecretId':'midsomerplots'}).promise();
    console.log(data);
    let config = JSON.parse(data.SecretString);

    FB.options({timeout: 2000, accessToken: config.FACEBOOK_ACCESS_TOKEN});

    const TwitterClient = new Twitter({
         consumer_key: config.TWITTER_CONSUMER_KEY,
         consumer_secret: config.TWITTER_CONSUMER_SECRET,
         access_token_key: config.TWITTER_ACCESS_TOKEN_KEY,
         access_token_secret: config.TWITTER_ACCESS_TOKEN_SECRET
        });

    const MastodonClient = new Mastodon(
      config.MASTODON_ACCESS_TOKEN,
      'https://mastodon.cloud' + '/api/v1'
    );
    const sqs = new AWS.SQS();
    const params = {
      QueueUrl: config.SQS_QUEUE_URL, /* required */
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
        post(generator.generate(seed),config.FACEBOOK_PAGE_ID,TwitterClient,MastodonClient);
        console.log(data);
      })
      .catch(function(err) {
        post(generator.generate(unixTimeInSec()),config.FACEBOOK_PAGE_ID,TwitterClient,MastodonClient);
        console.log(err);
      });
    }).catch(function(err) {
      post(generator.generate(unixTimeInSec()));
      console.log(err);
    });
    callback(null, { message: 'Bot tweeted successfully!', event });
  } catch(e) {
    console.log(e);
    callback(null, e);
  }
};
