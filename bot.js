import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import Twitter from 'twitter';
// eslint-disable-next-line sort-imports
import { Mastodon } from 'megalodon';
import midsomerplots from 'midsomerplots-content';

const secretsclient = new SecretsManagerClient();

const post = async (seed, TwitterClient, MastodonClient) => {
  let text = midsomerplots.generate(seed);
  while (text.length > 280) {
    text = midsomerplots.generate(unixTimeInSec());
  }

  let status = {
    status: text
  };
  TwitterClient.post('statuses/update', status, function(error, tweet, response) {
    if (!error) {
      console.log(tweet);
    }
    console.log(response);
  });

  await MastodonClient.postStatus(text, {spoiler_text: '#murderplot'});
};

const unixTimeInSec = function() {
  return Math.round((new Date()).getTime()/1000);
};

export const handler = async () => {

  try {
    const secretscommand = new GetSecretValueCommand({'SecretId':'midsomerplots'});
    const data = await secretsclient.send(secretscommand);
   
    const config = JSON.parse(data.SecretString);

    const TwitterClient = new Twitter({
         consumer_key: config.TWITTER_CONSUMER_KEY,
         consumer_secret: config.TWITTER_CONSUMER_SECRET,
         access_token_key: config.TWITTER_ACCESS_TOKEN_KEY,
         access_token_secret: config.TWITTER_ACCESS_TOKEN_SECRET
        });

    const MastodonClient = new Mastodon('https://mastodon.cloud', config.MASTODON_ACCESS_TOKEN);
    await post(unixTimeInSec(),TwitterClient,MastodonClient);

    return 'bot posted successfully';
  } catch(e) {

    return e;
  }
};
