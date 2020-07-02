import { Composer } from 'telegraf'
import { bot } from '../bot.js'
import { TelegrafContext } from '../types/telegraf'
import { sendTweets } from '../twitter/send-tweets'

const composer = new Composer()

composer.start(
  Composer.privateChat(
    async (ctx: TelegrafContext) => {
      if (/^[0-9]+$/i.test(ctx.startPayload)) {
        const [_, tweetId] = ctx.startPayload.match(/([0-9]+)$/i)
        return sendTweets(ctx, {
          tweetIds: [tweetId]
        })
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
)

bot.use(composer.middleware())
