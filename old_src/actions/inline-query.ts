import { Composer } from 'telegraf'
import { bot } from '../bot'
import getVideoUrl from '../lib/get-video-url'
import { getThumbUrl } from '../lib/get-thumb-url'
import { Composer as TGFComposer } from '../types/composer'
import { TelegrafContext } from '../types/telegraf'
import { FindQuery, DBTweetInterface } from 'mongodb'
import {
  ExtraAnswerInlineQuery,
  InlineQueryResult,
  InlineQueryResultPhoto
} from 'telegraf/typings/telegram-types'
import { TweetModel } from '../models/Tweet'
import { FullUser } from 'twitter-d'
import { sendError } from '../inline/send-error'
import { sendInlineTweet } from '../twitter/send-inline-tweet'

const composer = new Composer() as TGFComposer<TelegrafContext>

type fnCatchThrow = (fn: (ctx: TelegrafContext) => Promise<unknown>) => (ctx: TelegrafContext) => Promise<void>

type InlineQuery = {
  tweets: DBTweetInterface[],
  saved_tweets_count: { tweet: number }
}

const catchThrow: fnCatchThrow = fn => async ctx => {
  try {
    await fn(ctx)
  } catch (e) {
    console.log(e)
    await ctx.answerInlineQuery([sendError(e)])
  }
}

composer.inlineQuery(
  [
    /twitter\.com\/\S+\/status\/([0-9]+)/i,
    /^\S+\/([0-9]+)$/i,
    /^([0-9]+)$/i
  ],
  async (ctx: TelegrafContext) => {
    const [_, tweetId] = ctx.match
    try {
      const { results, options } = await sendInlineTweet(tweetId, ctx)
      await ctx.answerInlineQuery(results, options)
    } catch (e) {
      console.log(e)
      return ctx.answerInlineQuery([sendError(e)])
    }
  }
)

composer.on(
  'inline_query',
  catchThrow(
    async (ctx: TelegrafContext) => {
      if (ctx.inlineQuery.offset === 'none') {
        return ctx.answerInlineQuery([])
      }
      const query: FindQuery = {
        users: ctx.from.id,
        'tweet.extended_entities.media': { $exists: true }
      }
      const { private_mode } = ctx.state.user

      const { query: userQuery } = ctx.inlineQuery
      if (userQuery.includes('-u')) {
        query['tweet.user.screen_name'] = new RegExp(userQuery.replace('-u', '').trim(), 'i')
      } else if (userQuery) {
        query['tweet.text'] = new RegExp(userQuery, 'i')
      }
      const skip = ctx.inlineQuery.offset === ''
        ? 0
        : ctx.inlineQuery.offset === 'none'
          ? undefined
          : Number.parseInt(ctx.inlineQuery.offset)

      const aggregationQuery: any[] = [
        {
          $match: query
        },
        {
          $sort: {
            _id: -1
          }
        }
      ]

      if (skip && skip > 0) {
        aggregationQuery.push(
          {
            $skip: skip * 12
          }
        )
      }

      aggregationQuery.push(
        {
          $limit: 12
        }
      )

      const InlineAggregation: any[] = [
        {
          $facet: {
            tweets: aggregationQuery,
            saved_tweets_count: [
              {
                $match: query
              },
              {
                $count: 'tweet'
              }
            ]
          }
        }
      ]

      const [result] = await TweetModel.aggregate(InlineAggregation) as unknown as InlineQuery[]
      const { saved_tweets_count, tweets } = result
      const next_offset = tweets.length < 12 ? 'none' : `${skip + 1}`

      const inlineQueryResults: InlineQueryResult[] = []
      const options: ExtraAnswerInlineQuery = {
        cache_time: 15,
        is_personal: false,
        next_offset,
        switch_pm_text: `${private_mode ? 'private mode | ' : ''}${saved_tweets_count[0].tweet} tweets saved`,
        switch_pm_parameter: 'stats'
      }

      if (private_mode) {
        options.is_personal = true
        options.cache_time = 5
      }

      for (const { tweet } of tweets) {
        const user = tweet.user as FullUser
        const entities = tweet.extended_entities
        for (const entitie of entities.media) {
          if (entitie.type === 'photo') {
            inlineQueryResults.push({
              type: 'photo',
              id: entitie.id_str,
              photo_url: getThumbUrl(entitie.media_url_https, 'medium', 'jpg'),
              thumb_url: getThumbUrl(entitie.media_url_https),
              thumb_height: entitie.sizes.thumb.h,
              thumb_width: entitie.sizes.thumb.w,
              photo_height: entitie.sizes.medium.h,
              photo_width: entitie.sizes.medium.w,
              title: `${user.name}`,
              caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweet.id_str}">${user.name}</a>`,
              parse_mode: 'HTML'
            } as InlineQueryResultPhoto)
          } else if (entitie.type === 'video') {
            const { mime_type, video_url } = getVideoUrl(entitie.video_info)
            inlineQueryResults.push({
              type: 'video',
              video_url,
              mime_type,
              // thumb_url: `${entitie.media_url_https}:thumb`,
              thumb_url: getThumbUrl(entitie.media_url_https),
              thumb_height: entitie.sizes.thumb.h,
              thumb_width: entitie.sizes.thumb.w,
              title: `${user.name}`,
              video_duration: Math.floor(entitie.video_info.duration_millis / 1000),
              description: tweet.full_text,
              id: entitie.id_str,
              caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweet.id_str}">${user.name}</a>`,
              parse_mode: 'HTML'
            })
          } else if (entitie.type === 'animated_gif') {
            inlineQueryResults.push({
              type: 'gif',
              id: entitie.id_str,
              gif_url: entitie.video_info.variants.pop().url,
              thumb_url: entitie.media_url_https,
              thumb_height: entitie.sizes.thumb.h,
              thumb_width: entitie.sizes.thumb.w,
              title: `${user.name}`,
              caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweet.id_str}">${user.name}</a>`,
              parse_mode: 'HTML'
            })
          }
        }
      }

      return ctx.answerInlineQuery(
        inlineQueryResults,
        options
      )
    })
)

bot.use(composer.middleware())
