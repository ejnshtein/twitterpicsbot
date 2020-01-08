import { Composer } from 'telegraf-esm'
import tweetLoader from '../view/tweet-loader.js'
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
    /twitter\.com\/(\S+)\/status\/([0-9]+)/i,
    /(\S+)\/([0-9]+)/i
  ],
  catchThrow(async ctx => {
    const [_, username, tweetId] = ctx.match

    const { photo, text, response } = await tweetLoader(tweetId, username)

    const result = []

    const options = {
      cache_time: 30
    }

    if (photo) {
      result.push(
        {
          type: 'photo',
          photo_url: photo,
          thumb_url: photo,
          id: 1,
          caption: text,
          parse_mode: 'HTML'
        }
      )
    }
    if (response.images.length > 1) {
      options.switch_pm_text = 'Get an album'
      options.switch_pm_parameter = `${username}_${tweetId}`
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
