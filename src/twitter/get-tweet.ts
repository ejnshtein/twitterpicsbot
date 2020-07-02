import { store, reduceRemaining, twimo } from '.'
import sleep from '../lib/sleep.js'
import { Status as Tweet, Status } from 'twitter-d'
import { TweetModel } from '../models/Tweet.js'
import { lookupTweets } from '@yarnaimo/twimo'
import { DBTweetProjectionInterface } from 'mongodb'

const getTweetFromTwitter = (tweetId: string): Promise<Tweet> => lookupTweets(twimo, [tweetId]).then(([tweet]) => tweet)

// new Promise((resolve, reject) => {
// twitter.get(`statuses/show/${tweetId}`, (err, tweet: Tweet) => err ? reject(err) : resolve(tweet))
// })

interface GetTweetResult {
  ok: boolean,
  tweet: Tweet
  type?: string
  error?: Error
  wait?: number

}
interface GetTweetArguments {
  /**
   * Tweeter tweet id
   */
  tweetId: string
  /**
   * Telegram user id
   */
  fromId: number

  /**
   * Telegram user private mode
   */
  privateMode: boolean
}

const getAggregationTweetQuery = (tweetId: string, fromId: number): any[] => [
  {
    $match: {
      tweet_id: tweetId
    }
  },
  {
    $addFields: {
      added: {
        $in: [
          fromId,
          '$users'
        ]
      }
    }
  },
  {
    $project: {
      'tweet.extended_entities.media': 1,
      'tweet.user': 1,
      'tweet.id_str': 1,
      'tweet.created_at': 1,
      added: 1,
      tweet_id: 1,
      created_at: 1
    }
  }
]

export const getTweet = async ({
  tweetId,
  fromId,
  privateMode
}: GetTweetArguments): Promise<GetTweetResult> => {
  const state = store.getState()

  const [tweetInDb] = await TweetModel.aggregate(
    getAggregationTweetQuery(tweetId, fromId)
  ) as DBTweetProjectionInterface[]
  if (tweetInDb) {
    if (!privateMode && !tweetInDb.added) {
      await TweetModel.updateOne(
        {
          tweet_id: tweetId
        },
        {
          $addToSet: {
            users: fromId
          }
        }
      )
    }
    return {
      ok: true,
      tweet: tweetInDb.tweet
    }
  }
  if (state.remaining > 0) {
    try {
      const tweet = await getTweetFromTwitter(tweetId)
      await TweetModel.create({
        tweet_id: tweetId,
        tweet
      })
      if (!privateMode) {
        await TweetModel.updateOne(
          { tweet_id: tweetId },
          {
            $addToSet: {
              users: fromId
            }
          }
        )
      }
      await sleep(1000)
      reduceRemaining()
      return {
        ok: true,
        tweet
      }
    } catch (e) {
      return {
        ok: false,
        tweet: null,
        type: 'error',
        error: e
      }
    }
  } else {
    return {
      tweet: null,
      ok: false,
      type: 'limit exceeded',
      wait: Date.now() - state.reset.getTime()
    }
  }
}

export const getDBTweet = async ({
  tweetId,
  fromId,
  privateMode
}: GetTweetArguments): Promise<DBTweetProjectionInterface | Error | string> => {
  const state = store.getState()
  const [tweetInDb] = await TweetModel.aggregate(
    getAggregationTweetQuery(tweetId, fromId)
  ) as DBTweetProjectionInterface[]
  if (tweetInDb) {
    if (!privateMode && !tweetInDb.added) {
      await TweetModel.updateOne(
        {
          tweet_id: tweetId
        },
        {
          $addToSet: {
            users: fromId
          }
        }
      )
    }
    return tweetInDb
  }
  if (state.remaining > 0) {
    try {
      const tweet = await getTweetFromTwitter(tweetId)
      const newdbtweet = await TweetModel.create({
        tweet_id: tweetId,
        tweet
      })
      if (!privateMode) {
        await TweetModel.updateOne(
          { tweet_id: tweetId },
          {
            $addToSet: {
              users: fromId
            }
          }
        )
      }
      await sleep(1000)
      reduceRemaining()
      return {
        tweet: newdbtweet.tweet,
        tweet_id: tweetId,
        added: privateMode
      }
    } catch (e) {
      return e
    }
  } else {
    return `Limit exceeded, please wait ${Date.now() - state.reset.getTime()}`
  }
}
