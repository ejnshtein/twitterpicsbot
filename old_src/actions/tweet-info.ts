import { Composer } from 'telegraf'
import { bot } from '../bot'
import { getDBTweet } from '../twitter/get-tweet'
import { TelegrafContext } from '../types/telegraf'
import { templates } from '../lib/templates'

const composer = new Composer()

composer
  .command(
    'info',
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        if (ctx.message.reply_to_message) {
          if (
            /twitter\.com\/\S+\/[0-9]+/i.test(ctx.message.reply_to_message.text)
          ) {
            const [_, tweetId] = ctx.message.reply_to_message.text.match(/twitter\.com\/\S+\/([0-9]+)/i)
            const dbtweet = await getDBTweet({
              tweetId,
              fromId: ctx.from.id,
              privateMode: ctx.state.user.private_mode
            })
            if (dbtweet instanceof Error) {
              return ctx.reply(
                templates.error(dbtweet)
              )
            }
            if (typeof dbtweet === 'string') {
              return ctx.reply(
                dbtweet
              )
            }
            const text = templates.tweetInfo(dbtweet)
            return ctx.reply(
              text,
              {
                reply_to_message_id: ctx.message.reply_to_message.message_id,
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: 'Get media as files',
                        callback_data: `getfiles:id=${tweetId}`
                      }
                    ]
                  ]
                }
              }
            )
          } else {
            return ctx.reply(
              'Tweet link not found.',
              {
                reply_to_message_id: ctx.message.message_id
              }
            )
          }
        } else {
          return ctx.reply(
            'Use this command in reply to message with tweet link.',
            {
              reply_to_message_id: ctx.message.message_id
            }
          )
        }
      }
    )
  )

bot.use(composer.middleware())
