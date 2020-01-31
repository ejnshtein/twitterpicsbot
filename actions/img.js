import { Composer } from 'telegraf-esm'
import { getTweet } from '../store/twitter.js'
import { onlyPrivate } from '../middlewares/index.js'
import { bot } from '../core/bot.js'
import { templates } from '../lib/index.js'

const composer = new Composer()

composer.action(
  [
    /allimg:\S+\/([0-9]+)/i,
    /allimg:([0-9]+)/i
  ],
  onlyPrivate,
  async ctx => {
    const [_, tweetId] = ctx.match

    const { error, tweet, type, wait } = await getTweet({ tweetId, fromId: ctx.from.id })

    if (error) {
      throw ctx.answerCbQuery(templates.error(error), true)
    }

    if (type === 'limit exceeded') {
      return ctx.answerCbQuery(`Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} minutes`, true)
    }

    const images = tweet.entities.media
      .filter(({ type }) === 'photo')
      .map(({ media_url_https }) => media_url_https)

    if (images.length > 1) {
      await ctx.replyWithMediaGroup(
        images.map((imgUrl, index) => ({
          type: 'photo',
          media: imgUrl,
          caption: index === 0 ? `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>` : '',
          parse_mode: 'HTML'
        }))
      )
      await ctx.deleteMessage()
    }
    ctx.answerCbQuery('')
  })

bot.use(composer.middleware())
