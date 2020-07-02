export default class Twitter {
  constructor (options: TwitterOptions)

  get<T>(method: string, params: {}, callback: (err: Error, result: T) => void)
  get<T>(method: string, callback: (err: Error, result: T) => void)
}

export interface TwitterOptions {
  consumer_key: string
  consumer_secret: string
  access_token_key: string
  access_token_secret: string
}

export interface APILimits {
  rate_limit_context: {
    access_token: string
  }
  resources: {
    statuses: APIResourceLimits
  }
}

type APIResourceLimits = {
  [key: string]: {
    reset: number
    limit: number
    remaining: number
  }
}