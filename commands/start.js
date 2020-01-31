import { Composer } from 'telegraf-esm'
import { getTweet } from '../store/twitter.js'
import { onlyPrivate } from '../middlewares/index.js'
import { bot } from '../core/bot.js'

const composer = new Composer()

composer.start(onlyPrivate, async ctx => {
  if ([/^\S+_[0-9]+$/i, /^[0-9]+$/i].some(regex => regex.test(ctx.startPayload))) {
    const [_, tweetId] = ctx.startPayload.match(/([0-9]+)$/i)
    const { error, tweet, type, wait } = await getTweet({ tweetId, fromId: ctx.from.id })

    if (error) {
      throw error
    }

    if (type === 'limit exceeded') {
      throw new Error(`Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} minutes`)
    }

    const images = tweet.entities.media
      .filter(({ type }) === 'photo')
      .map(({ media_url_https }) => media_url_https)
      
    if (images.length >= 1) {
      return ctx.replyWithMediaGroup(
        images.map((imgUrl, index) => ({
          type: 'photo',
          media: imgUrl,
          caption: index === 0 ? `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>` : '',
          parse_mode: 'HTML'
        }))
      )
    }
  }
  return ctx.reply(
    'Hello! Send me link to tweet to start working!',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Use inline mode',
              switch_inline_query_current_chat: ''
            }
          ],
          [
            {
              text: 'Grab some tweets from Twitter',
              url: 'https://twitter.com'
            }
          ]
        ]
      }
    }
  )
})

bot.use(composer.middleware())
