import { Composer } from 'telegraf'
import { bot } from '../bot'
import { parse } from 'querystring'
import { TelegrafContext } from '../types/telegraf'
import { sendMedia } from '../twitter/send-media'
import { templates } from '../lib/templates'

const composer = new Composer()

const tweetTest = /twitter\.com\/\S+\/([0-9]+)/i

composer
  .action(
    /getfiles:(\S+)/i,
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        const { id } = parse(ctx.match[1])
        try {
          await sendMedia(
            ctx,
            {
              tweetIds: [id as string]
            }
          )
          await ctx.answerCbQuery('')
        } catch (e) {
          return ctx.answerCbQuery(templates.error(e), true)
        }
      }
    )
  )
  .action(
    'getfiles',
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        if (!ctx.callbackQuery.message.reply_to_message) {
          return ctx.answerCbQuery('Replied message not found.')
        }
        const tweetIds = ctx.callbackQuery.message.reply_to_message.entities
          .filter(
            entitie => (
              entitie.type === 'text_link' && tweetTest.test(entitie.url)
            ) || (
              entitie.type === 'url' && tweetTest.test(
                ctx.callbackQuery.message.reply_to_message.text.slice(
                  entitie.offset,
                  entitie.offset + entitie.length
                )
              )
            )
          )
          .map(
            entitie => (
              entitie.type === 'text_link' && entitie.url.match(tweetTest)[1]
            ) || (
              entitie.type === 'url' && ctx.callbackQuery.message.reply_to_message.text.slice(
                entitie.offset,
                entitie.offset + entitie.length
              ).match(tweetTest)[1]
            )
          )
        if (tweetIds.length === 0) {
          return ctx.answerCbQuery('Tweets not found.')
        }
        try {
          await sendMedia(
            ctx,
            { tweetIds }
          )
          await ctx.answerCbQuery('')
        } catch (e) {
          return ctx.answerCbQuery(templates.error(e), true)
        }
      }
    )
  )

bot.use(composer.middleware())
