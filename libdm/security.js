crypto = require('crypto');

var security = {};

/**
 * Creates a HMAC SHA-256 hash created from the app TOKEN and
 * your app Consumer Secret.
 * @param  token  the token provided by the incoming GET request
 * @return string
 */
security.get_challenge_response = function(crc_token, consumer_secret) {

  console.log("crc_token: " +crc_token);
  console.log("TWITTER_CONSUMER_SECRET: " + consumer_secret);
  hmac = crypto.createHmac('sha256', consumer_secret).update(crc_token).digest('base64');

  return hmac;
};


module.exports = security;
