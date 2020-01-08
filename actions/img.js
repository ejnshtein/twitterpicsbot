import { Composer } from 'telegraf-esm'
import tweetLoader from '../view/tweet-loader.js'
import { onlyPrivate } from '../middlewares/index.js'
import { bot } from '../core/bot.js'

const composer = new Composer()

composer.action(
  /allimg:(\S+)\/([0-9]+)/i,
  onlyPrivate,
  async ctx => {
    const [_, username, tweetId] = ctx.match

    const { text, response } = await tweetLoader(tweetId, username)

    if (response.images.length > 1) {
      await ctx.replyWithMediaGroup(
        response.images.map((imgUrl, index) => ({
          type: 'photo',
          media: imgUrl,
          caption: index === 0 ? text : '',
          parse_mode: 'HTML'
        }))
      )
      await ctx.deleteMessage()
    }
    ctx.answerCbQuery('')
  })

bot.use(composer.middleware())
