import { Status } from 'twitter-d'

export type FindQuery = { [key: string]: unknown }

export interface DBTweetInterface {
  tweet_id: string
  tweet: Status
  users: [number]
  id?: string
}

export interface DBTweetProjectionInterface {
  tweet_id: string
  tweet: Status
  added: boolean
  created_at?: number
}
