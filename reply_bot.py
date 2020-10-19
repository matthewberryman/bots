#!/usr/bin/env python
# tweepy-bots/bots/autoreply.py

import tweepy
import logging
import time
from dotenv import load_dotenv
load_dotenv()
import os, sys
import re
import pickle

from urllib.request import urlopen
import json


def get_jsonparsed_data(url):
    """
    Receive the content of ``url``, parse it as JSON and return the object.

    Parameters
    ----------
    url : str

    Returns
    -------
    dict
    """
    response = urlopen(url)
    data = response.read().decode("utf-8")
    return json.loads(data)

#pandas.set_option("display.max_rows", None, "display.max_columns", None)
#print(ppm)
#print(world)
#exit()



def create_api():
  consumer_key = os.getenv("CONSUMER_KEY")
  consumer_secret = os.getenv("CONSUMER_SECRET")
  access_token = os.getenv("ACCESS_TOKEN")
  access_token_secret = os.getenv("ACCESS_TOKEN_SECRET")

  auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
  auth.set_access_token(access_token, access_token_secret)
  api = tweepy.API(auth, wait_on_rate_limit=True, wait_on_rate_limit_notify=True)
  try:
    api.verify_credentials()
  except Exception as e:
    logger.error("Error creating API", exc_info=True)
    raise e
  logger.info("API created")
  return api

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

def check_mentions(api, since_id):
  logger.info("Retrieving mentions")
  new_since_id = since_id
  print(since_id)
  for tweet in tweepy.Cursor(api.mentions_timeline,since_id=since_id).items():
    print(tweet.id)
    new_since_id = max(tweet.id, new_since_id)
    
    try:
      if " plot" in tweet.text.lower() or "murder" in tweet.text.lower():

        plot = get_jsonparsed_data("https://midsomerplots.acrossthecloud.net/plot")["plot"]
        print(plot)

        plot = "You are found" + plot.split("is found")[1]


        
        logger.info(f"Answering to {tweet.user.name}")
        api.update_status(
          status=plot,
          in_reply_to_status_id=tweet.id,
          auto_populate_reply_metadata=True
        )
    except Exception:
      logger.error("Fatal error in main loop", exc_info=True)
  return new_since_id

def main():
  api = create_api()

  since_id=1317962147847131136
  with open('since_id', 'rb') as f:
    since_id = int(pickle.load(f))
    f.close()

  while True:
    since_id = check_mentions(api, since_id)
    with open('since_id', 'wb') as f:
      pickle.dump(since_id,f)
      f.close()
    logger.info("Waiting...")
    time.sleep(30)

if __name__ == "__main__":
  main()
