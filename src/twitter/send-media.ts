import { FullUser } from 'twitter-d'
import { getTweet } from './get-tweet'
import { TelegrafContext } from '../types/telegraf'
import { getThumbUrl } from '../lib/get-thumb-url'
import getVideoUrl from '../lib/get-video-url'
import { templates } from '../lib/templates'
import { onLimitExceeded } from './send-tweets'

type SendMediaArguments = {
  tweetIds: string[]
}

export const sendMedia = async (
  ctx: TelegrafContext,
  { tweetIds }: SendMediaArguments
): Promise<void> => {
  for (const tweetId of tweetIds) {
    const { tweet, error, type, wait } = await getTweet({
      tweetId: tweetId,
      fromId: ctx.from.id,
      privateMode: ctx.state.user.private_mode
    })

    switch (true) {
      case error instanceof Error: {
        await ctx.reply(templates.error(error))
        return
      }
      case type === 'limit exceeded': {
        await ctx.reply(
          onLimitExceeded({
            tweets: tweetIds.map(id => [undefined, id]),
            wait
          })
        )
        return
      }
    }
    const entities = tweet.extended_entities

    const user = tweet.user as FullUser
    let i = 0
    for (const entitie of entities.media) {
      if (entitie.type === 'photo') {
        await ctx.replyWithDocument(
          {
            filename: `${user.screen_name}-${tweetId}-photo-${i}.jpg`,
            url: getThumbUrl(entitie.media_url_https, 'large', 'jpg')
          },
          {
            caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweetId}">${user.name}</a> photo${entities.media.length > 1 ? ` (${i + 1}/${entities.media.length})` : ''}`,
            thumb: getThumbUrl(entitie.media_url_https),
            parse_mode: 'HTML'
          }
        )
      } else if (entitie.type === 'video') {
        const { video_url, mime_type } = getVideoUrl(entitie.video_info)
        await ctx.replyWithDocument(
          {
            filename: `${user.screen_name}-${tweetId}-video-${i}.${mime_type}`,
            url: video_url
          },
          {
            caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweetId}">${user.name}</a> video${entities.media.length > 1 ? ` (${i + 1}/${entities.media.length})` : ''}`,
            thumb: getThumbUrl(entitie.media_url_https),
            parse_mode: 'HTML'
          }
        )
      } else if (entitie.type === 'animated_gif') {
        await ctx.replyWithDocument(
          {
            filename: `${user.screen_name}-${tweetId}-gif-${i}.gif`,
            url: entitie.video_info.variants.pop().url
          },
          {
            caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweetId}">${user.name}</a> gif${entities.media.length > 1 ? ` (${i + 1}/${entities.media.length})` : ''}`,
            thumb: getThumbUrl(entitie.media_url_https),
            parse_mode: 'HTML'
          }
        )
      }
      i++
    }
  }
}
