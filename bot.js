import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import pkg from '@atproto/api';
import JaneAustenQuotes from 
'JaneAustenQuotes';
import { Mastodon } from 'megalodon';
import midsomerplots from 'midsomerplots-content';

const secretsclient = new SecretsManagerClient();
const { BskyAgent } = pkg;

const post = async (seed, MastodonClient, BlueSkyClient) => {
  let text = process.env.BOT_NAME == 'midsomerplots' ? midsomerplots.generate(seed) : JaneAustenQuotes.generate(seed);

  await BlueSkyClient.post({ text });
  if (process.env.BOT_NAME === 'midsomerplots') {
    await MastodonClient.postStatus(text, {spoiler_text: '#murderplot', visibility: 'unlisted'});
  } else {
   await MastodonClient.postStatus(text, {visibility: 'unlisted'});
  }
};


const unixTimeInSec = function() {
  return Math.round((new Date()).getTime()/1000);
};

export const handler = async () => {

  try {
    const secretscommand = new GetSecretValueCommand({'SecretId':process.env.BOT_NAME});
    const data = await secretsclient.send(secretscommand);
   
    const config = JSON.parse(data.SecretString);


    const BlueSkyClient = new BskyAgent({ service: "https://bsky.social"});
    await BlueSkyClient.login({
      identifier: config.BSKY_IDENTIFIER,
      password: config.BSKY_PASSWORD,
    });
    const MastodonClient = new Mastodon('https://mastodon.cloud', config.MASTODON_ACCESS_TOKEN);
    await post(unixTimeInSec(),MastodonClient,BlueSkyClient);


    return 'bot posted successfully';
  } catch(e) {
    console.log(e.message);
    
    return e.message;
  }
};
