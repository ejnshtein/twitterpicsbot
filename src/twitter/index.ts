import { createStore, createEffect, createEvent } from 'effector'
import { APILimits } from 'twitter'
import { scheduleJob } from 'node-schedule'
import env from '../env.js'
import { Twimo, lookupTweets, twget } from '@yarnaimo/twimo'

export const twimo = Twimo({
  consumerKey: env.TWITTER_CONSUMER_KEY,
  consumerSecret: env.TWITTER_CONSUMER_SECRET
})({
  token: env.TWITTER_ACCESS_TOKEN_KEY,
  tokenSecret: env.TWITTER_ACCESS_TOKEN_SECRET
})

const getLimits = (): Promise<APILimits> => twget(twimo, 'application/rate_limit_status')
// new Promise((resolve, reject) => {
//   twitter.get('application/rate_limit_status', (err, data: APILimits) => err ? reject(err) : resolve(data))
// })

interface FetchLimitsResult {
  reset: Date
  limit: number
  remaining: number
}

const fetchLimits = createEffect<void, FetchLimitsResult>('get limits', {
  async handler (): Promise<FetchLimitsResult> {
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

export const reduceRemaining = createEvent('reduce remaining')

export const store = createStore({
  limit: 180,
  remaining: 180,
  reset: new Date(Date.now() + (15 * 1000)),
  job: scheduleJob(
    new Date(Date.now() + (15 * 1000)),
    () => fetchLimits()
  )
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
    state.job.reschedule(reset.toUTCString())
    return state
  })
  .on(reduceRemaining, (state) => ({
    ...state,
    remaining: state.remaining > 1 ? state.remaining - 1 : 0
  }))

fetchLimits()
