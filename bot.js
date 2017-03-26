var Twitter = require('twitter');
var text2png = require('text2png');
var generator = require('generator');

var client = new Twitter({
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
  xpadding: 25,
  ypadding: 25
};


var truncate = function(string) {
   if (string.length > 140)
      return string.substring(0,string.lastIndexOf(' ',137))+'...';
   else
      return string;
};

var stringWrap = function (str, width, spaceReplacer) {
    if (str.length>width) {
        var p=width
        for (;p>0 && str[p]!=' ';p--) {
        }
        if (p>0) {
            var left = str.substring(0, p);
            var right = str.substring(p+1);
            return left + spaceReplacer + stringWrap(right, width, spaceReplacer);
        }
    }
    return str;
}

module.exports.tweet = (event, context, callback) => {

  var text = generator.generate();

  // Make post request on media endpoint. Pass file data as media parameter
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
  callback(null, { message: 'Bot tweeted successfully!', event });
};
