import { Composer } from 'telegraf'
import { getTweet } from '../twitter/get-tweet'
import { bot } from '../bot'
import { templates } from '../lib/templates'
import { FullUser } from 'twitter-d'
import { TelegrafContext } from '../types/telegraf'

const composer = new Composer()

composer.action(
  [
    /allimg:\S+\/([0-9]+)/i,
    /allimg:([0-9]+)/i
  ],
  Composer.privateChat(
    async (ctx: TelegrafContext) => {
      const [_, tweetId] = ctx.match

      const { error, tweet, type, wait } = await getTweet({
        tweetId,
        fromId: ctx.from.id,
        privateMode: ctx.state.user.private_mode
      })

      if (error) {
        throw ctx.answerCbQuery(templates.error(error), true)
      }

      if (type === 'limit exceeded') {
        return ctx.answerCbQuery(`Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} minutes`, true)
      }

      const images = tweet.extended_entities.media
        .filter(({ type }) => type === 'photo')
        .map(({ media_url_https }) => media_url_https)
      const user = tweet.user as FullUser

      if (images.length > 1) {
        await ctx.replyWithMediaGroup(
          images.map((imgUrl, index) => ({
            type: 'photo',
            media: imgUrl,
            caption: index === 0 ? `<a href="https://twitter.com/${user.screen_name}/status/${tweet.id_str}">${user.name}</a>` : '',
            parse_mode: 'HTML'
          }))
        )
        await ctx.deleteMessage()
      }
      ctx.answerCbQuery('')
    }
  )
)

bot.use(composer.middleware())
