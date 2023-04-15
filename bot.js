import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { TwitterApi } from 'twitter-api-v2';
// eslint-disable-next-line sort-imports
import { Mastodon } from 'megalodon';
import midsomerplots from 'midsomerplots-content';

const secretsclient = new SecretsManagerClient();

const post = async (seed, TwitterClient, MastodonClient) => {
  let text = midsomerplots.generate(seed);
  while (text.length > 280) {
    text = midsomerplots.generate(unixTimeInSec());
  }

  await TwitterClient.v2.tweet(text);

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

    const TwitterClient = new TwitterApi({
         appKey: config.TWITTER_CONSUMER_KEY,
         appSecret: config.TWITTER_CONSUMER_SECRET,
         accessToken: config.TWITTER_ACCESS_TOKEN_KEY,
         accessSecret: config.TWITTER_ACCESS_TOKEN_SECRET
        }).readWrite;

    const MastodonClient = new Mastodon('https://mastodon.cloud', config.MASTODON_ACCESS_TOKEN);
    await post(unixTimeInSec(),TwitterClient,MastodonClient);

    return 'bot posted successfully';
  } catch(e) {
    console.log(e.message);
    
    return e.message;
  }
};
