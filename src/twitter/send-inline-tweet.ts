import {
  InlineQueryResult,
  ExtraAnswerInlineQuery,
  InlineQueryResultPhoto,
  InlineQueryResultVideo,
  InlineQueryResultGif
} from 'telegraf/typings/telegram-types'
import { FullUser } from 'twitter-d'
import { getTweet } from './get-tweet'
import { TelegrafContext } from '../types/telegraf'
import { sendError } from '../inline/send-error'
import { getThumbUrl } from '../lib/get-thumb-url'
import getVideoUrl from '../lib/get-video-url'

type InlineTweetResult = {
  results: InlineQueryResult[]
  options: ExtraAnswerInlineQuery
}

export const sendInlineTweet = async (id: string, ctx: TelegrafContext): Promise<InlineTweetResult> => {
  const results: InlineQueryResult[] = []
  const options: ExtraAnswerInlineQuery = {
    cache_time: 5
  }
  const { error, tweet, type, wait } = await getTweet({
    tweetId: id,
    fromId: ctx.from.id,
    privateMode: ctx.state.user.private_mode
  })

  switch (true) {
    case error instanceof Error: {
      throw error
    }
    case type === 'limit exceeded': {
      throw new Error(
        `Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} minutes`
      )
    }
  }

  const entities = tweet.extended_entities || tweet.entities

  const user = tweet.user as FullUser
  options.switch_pm_parameter = `${id}`
  options.switch_pm_text = `Get media${entities.media.length > 1 ? ` (${entities.media.length})` : ''}`

  for (const entitie of entities.media) {
    if (entitie.type === 'photo') {
      results.push({
        type: 'photo',
        id: entitie.id_str,
        photo_url: getThumbUrl(entitie.media_url_https, 'large', 'jpg'),
        thumb_url: getThumbUrl(entitie.media_url_https),
        photo_height: entitie.sizes.large.h,
        photo_width: entitie.sizes.large.w,
        title: `${user.name}`,
        caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweet.id_str}">${user.name}</a>`,
        parse_mode: 'HTML'
      } as InlineQueryResultPhoto)
    } else if (entitie.type === 'video') {
      const { mime_type, video_url } = getVideoUrl(entitie.video_info)
      results.push({
        type: 'video',
        video_url,
        mime_type,
        thumb_url: entitie.media_url_https,
        title: `${user.name}`,
        id: entitie.id_str,
        caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweet.id_str}">${user.name}</a>`,
        parse_mode: 'HTML'
      } as InlineQueryResultVideo)
    } else if (entitie.type === 'animated_git') {
      results.push({
        type: 'gif',
        id: entitie.id_str,
        gif_url: entitie.video_info.variants.pop().url,
        thumb_url: entitie.media_url_https,
        title: `${user.name}`,
        caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweet.id_str}">${user.name}</a>`,
        parse_mode: 'HTML'
      } as InlineQueryResultGif)
    }
  }

  return {
    options,
    results
  }
}
