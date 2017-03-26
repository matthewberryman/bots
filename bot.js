var Twitter = require('twitter');
var text2png = require('text2png');
var generator = require('generator');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var truncate = function(string) {
   if (string.length > 140)
      return string.substring(0,string.lastIndexOf(' ',137)+'...');
   else
      return string;
};

module.exports.tweet = (event, context, callback) => {

  var text = generator.generate();

  // Make post request on media endpoint. Pass file data as media parameter
  client.post('media/upload', {media: text2png(text, {textColor: 'blue'})}, function(error, media, response) {

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
  callback(null, { message: 'Bot tweeted successfully!', event });
};
