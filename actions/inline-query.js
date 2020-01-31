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

    const { error, tweet, type, wait } = await getTweet(tweetId)

    if (error) {
      throw error
    }

    if (type === 'limit exceeded') {
      throw new Error(`Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} minutes`)
    }

    const images = tweet.entities.media
      .filter(({ type }) === 'photo')
      .map(({ media_url_https }) => media_url_https)

    const result = images
      .map((url, i) => ({
        type: 'photo',
        photo_url: url,
        thumb_url: url,
        id: 1,
        caption: i === 0 ? `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>` : '',
        parse_mode: 'HTML'
      }))
    const options = {
      cache_time: 30
    }

    result.push(
    )
    if (images.length > 1) {
      options.switch_pm_text = 'Get an album'
      options.switch_pm_parameter = `${tweetId}`
    }
    return ctx.answerInlineQuery(result, options)
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
