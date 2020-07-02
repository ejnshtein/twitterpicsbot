import { Composer } from 'telegraf'
import { bot } from '../bot'
import { templates } from '../lib/templates'
import { sendTweets } from '../twitter/send-tweets'
import { TelegrafContext } from '../types/telegraf'

const composer = new Composer()

// Echo scene
composer
  .hears(
    /twitter\.com\/\S+\/status\/[0-9]+/i,
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        try {
          await sendTweets(
            ctx,
            {
              text: ctx.message.text,
              messageId: ctx.message.message_id
            }
          )
        } catch (e) {
          console.log(e)
          return ctx.reply(templates.error(e), {
            reply_to_message_id: ctx.message.message_id,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Try again',
                    callback_data: 'tweets_retry'
                  }
                ]
              ]
            }
          })
        }
      }
    )
  )
  .action(
    'tweets',
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        try {
          await sendTweets(
            ctx,
            {
              text: ctx.callbackQuery.message.reply_to_message.text,
              messageId: ctx.callbackQuery.message.reply_to_message.message_id
            }
          )
          await ctx.answerCbQuery('')
          await ctx.deleteMessage()
        } catch (e) {
          console.log(e)
          return ctx.answerCbQuery(templates.error(e))
        }
      }
    )
  )
  .action(
    'tweets_retry',
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        try {
          await sendTweets(
            ctx,
            {
              text: ctx.callbackQuery.message.reply_to_message.text,
              messageId: ctx.callbackQuery.message.reply_to_message.message_id
            }
          )
          await ctx.answerCbQuery('')
          await ctx.deleteMessage()
        } catch (e) {
          console.log(e)
          return ctx.answerCbQuery(templates.error(e))
        }
      }
    )
  )

bot.use(composer.middleware())
