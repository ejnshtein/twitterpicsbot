import effector from 'effector'
import Twitter from 'twitter'
import nodeSchedule from 'node-schedule'
import env from '../env.js'
import collection from '../core/database/index.js'
import sleep from '../lib/sleep.js'

const { createStore, createEffect, createEvent } = effector
const { scheduleJob } = nodeSchedule

const twitter = new Twitter({
  consumer_key: env.TWITTER_CONSUMER_KEY,
  consumer_secret: env.TWITTER_CONSUMER_SECRET,
  access_token_key: env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: env.TWITTER_ACCESS_TOKEN_SECRET
})

const getLimits = () => new Promise((resolve, reject) => {
  twitter.get('application/rate_limit_status', (err, data) => err ? reject(err) : resolve(data))
})

const getTweetFromTwitter = (tweetId) => new Promise((resolve, reject) => {
  twitter.get(`statuses/show/${tweetId}`, (err, tweet) => err ? reject(err) : resolve(tweet))
})

export const fetchLimits = createEffect('get limits', {
  handler: async () => {
    const limits = await getLimits()
    const { reset, limit, remaining } = limits.resources.statuses['/statuses/show/:id']
    return {
      reset: new Date(reset * 1000),
      limit,
      remaining
    }
  }
})

const resetJob = fetchLimits.done.map(({ result }) => result.reset)

const reduceRemaining = createEvent('reduce remaining')

export const store = createStore({
  limit: 180,
  remaining: 180,
  reset: new Date(Date.now() + (15 * 1000)),
  job: scheduleJob(new Date(Date.now() + (15 * 1000)), fetchLimits)
})
  .on(
    fetchLimits.done,
    (state, { result: { limit, reset, remaining } }) => ({
      ...state,
      limit,
      reset,
      remaining
    })
  )
  .on(resetJob, (state, reset) => {
    state.job.reschedule(reset)
    return state
  })
  .on(reduceRemaining, (state) => ({
    ...state,
    remaining: state.remaining > 1 ? state.remaining - 1 : 0
  }))

export const getTweet = createEffect('get tweet', {
  handler: async ({ tweetId, fromId }) => {
    const state = store.getState()

    const tweetInDb = await collection('tweets').findOne({ id: tweetId })
    if (tweetInDb) {
      await collection('users').updateOne({ id: fromId }, { $addToSet: { tweets: tweetInDb.id } })
      return {
        ok: true,
        tweet: tweetInDb.tweet
      }
    }
    if (state.remaining > 0) {
      try {
        const tweet = await getTweetFromTwitter(tweetId)
        await collection('tweets').create({ id: tweet.id_str, tweet })
        await collection('users').updateOne({ id: fromId }, { $addToSet: { tweets: tweet.id_str } })
        await sleep(1000)
        reduceRemaining()
        return {
          ok: true,
          tweet
        }
      } catch (e) {
        return {
          ok: false,
          type: 'error',
          error: e
        }
      }
    } else {
      return {
        ok: false,
        type: 'limit exceeded',
        wait: state.reset.getTime() - Date.now()
      }
    }
  }
})

// forward({
//   from: getTweet.done,
//   to: reduceRemaining
// })

// store.watch(getTweet.done, (state) => {
//   console.log(state.remaining)
// })
// store.watch(fetchLimits.done, (state) => {
//   console.log(state.remaining)
// })

fetchLimits()
