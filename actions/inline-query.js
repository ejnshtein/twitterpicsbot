import { Composer } from 'telegraf-esm'
import { getTweet } from '../store/twitter.js'
import { bot } from '../core/bot.js'

const composer = new Composer()

const catchThrow = fn => async ctx => {
  if (fn.then) {
    try {
      await fn(ctx)
    } catch (e) {
      return ctx.answerInlineQuery(sendError(e))
    }
  } else {
    try {
      fn(ctx)
    } catch (e) {
      return ctx.answerInlineQuery(sendError(e))
    }
  }
}

composer.inlineQuery(
  [
    /twitter\.com\/\S+\/status\/([0-9]+)/i,
    /^\S+\/([0-9]+)$/i,
    /^([0-9]+)$/i
  ],
  catchThrow(async ctx => {
    const [_, tweetId] = ctx.match

    const { error, tweet, type, wait } = await getTweet({ tweetId, fromId: ctx.from.id })

    if (error) {
      throw error
    }

    if (type === 'limit exceeded') {
      throw new Error(`Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} minutes`)
    }

    if (
      tweet.extended_entities &&
      tweet.extended_entities.media.length > 0 &&
      tweet.extended_entities.media.some(({ type }) => type === 'photo')
    ) {
      const images = tweet.extended_entities.media
        .filter(({ type }) => type === 'photo')
        .map(({ media_url_https }) => media_url_https)
      const result = images
        .map((url, i) => ({
          type: 'photo',
          photo_url: url,
          thumb_url: url,
          id: `${i}`,
          caption: i === 0 ? `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>` : '',
          parse_mode: 'HTML'
        }))
      const options = {
        cache_time: 30
      }
      if (images.length > 1) {
        options.switch_pm_text = 'Get an album'
        options.switch_pm_parameter = `${tweetId}`
      }
      return ctx.answerInlineQuery(result, options)
    } else {
      return ctx.answerInlineQuery([])
    }
  }))

composer.on(
  'inline_query',
  catchThrow(async ctx => {
    if (ctx.inlineQuery.offset === 'none') {
      return ctx.answerInlineQuery([])
    }
    const query = {
      users: ctx.from.id,
      'tweet.extended_entities': { $exists: true }
    }
    if (ctx.inlineQuery.query) {
      query['tweet.user.screen_name'] = new RegExp(ctx.inlineQuery.query, 'i')
    }
    const skip = Number.parseInt(ctx.inlineQuery.offset) || 0

    const result = await ctx.db('tweets')
      .find(query)
      .limit(12)
      .skip(skip * 12)
      .sort('-_id')
      .exec()
    return ctx.answerInlineQuery(
      result.reduce((acc, tweet) => {
        return acc.concat(
          tweet.tweet.extended_entities.media.map(
            ({ id_str, media_url_https, sizes }) => ({
              type: 'photo',
              id: id_str,
              photo_url: media_url_https,
              thumb_url: media_url_https + '?format=jpg&name=small',
              photo_width: sizes.small.w,
              photo_height: sizes.small.h,
              parse_mode: 'HTML',
              caption: `<a href="https://twitter.com/${tweet.tweet.user.screen_name}/status/${tweet.tweet.id_str}">${tweet.tweet.user.screen_name}</a>`
            })
          )
        )
      }, []),
      {
        cache_time: 5,
        is_personal: false,
        next_offset: result.length < 12 ? 'none' : `${skip + 1}`
      }
    )
  }))

const sendError = error => [
  {
    type: 'article',
    id: '1',
    title: 'Error!',
    description: `Something went wrong... ${error.message}`,
    input_message_content: {
      message_text: `Something went wrong... ${error.message}`
    }
  }
]

bot.use(composer.middleware())
