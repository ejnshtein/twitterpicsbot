import { Composer } from 'telegraf'
import { bot } from '../bot'
import { parse } from 'querystring'
import { TelegrafContext } from '../types/telegraf'
import { getTweet } from '../twitter/get-tweet'
import { FullUser } from 'twitter-d'
import { templates } from '../lib/templates'
import { onLimitExceeded, InputMedia } from '../twitter/send-tweets'
import { getThumbUrl } from '../lib/get-thumb-url'
import getVideoUrl from '../lib/get-video-url'

const composer = new Composer()

composer.action(
  /getfiles:(\S+)/i,
  Composer.privateChat(
    async (ctx: TelegrafContext) => {
      await ctx.answerCbQuery('Working...')
      const { id } = parse(ctx.match[1])
      const { tweet, error, type, wait } = await getTweet({
        tweetId: id as string,
        fromId: ctx.from.id,
        privateMode: ctx.state.user.private_mode
      })

      switch (true) {
        case error instanceof Error: {
          return ctx.reply(templates.error(error))
        }
        case type === 'limit exceeded': {
          return ctx.reply(
            onLimitExceeded({ tweets: [[id as string]], wait })
          )
        }
      }
      const entities = tweet.extended_entities

      const user = tweet.user as FullUser
      let i = 0
      for (const entitie of entities.media) {
        if (entitie.type === 'photo') {
          await ctx.replyWithDocument(
            {
              filename: `${user.screen_name}-${id}-photo-${i}.jpg`,
              url: getThumbUrl(entitie.media_url_https, 'large', 'jpg')
            },
            {
              caption: `<a href="https://twitter.com/${user.screen_name}/status/${id}">${user.name}</a> photo${entities.media.length > 1 ? ` (${i + 1}/${entities.media.length})` : ''}`,
              thumb: getThumbUrl(entitie.media_url_https, 'thumb', 'jpg'),
              parse_mode: 'HTML'
            }
          )
        } else if (entitie.type === 'video') {
          const { video_url, mime_type } = getVideoUrl(entitie.video_info)
          await ctx.replyWithDocument(
            {
              filename: `${user.screen_name}-${id}-video-${i}.${mime_type}`,
              url: video_url
            },
            {
              caption: `<a href="https://twitter.com/${user.screen_name}/status/${id}">${user.name}</a> video${entities.media.length > 1 ? ` (${i + 1}/${entities.media.length})` : ''}`,
              thumb: entitie.media_url_https,
              parse_mode: 'HTML'
            }
          )
        } else if (entitie.type === 'animated_gif') {
          await ctx.replyWithDocument(
            {
              filename: `${user.screen_name}-${id}-gif-${i}.gif`,
              url: entitie.video_info.variants.pop().url
            },
            {
              caption: `<a href="https://twitter.com/${user.screen_name}/status/${id}">${user.name}</a> gif${entities.media.length > 1 ? ` (${i + 1}/${entities.media.length})` : ''}`,
              thumb: entitie.media_url_https,
              parse_mode: 'HTML'
            }
          )
        }
        i++
      }
    }
  )
)

bot.use(composer.middleware())
