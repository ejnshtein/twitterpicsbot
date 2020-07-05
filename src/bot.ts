import Telegraf from 'telegraf'
import env from './env.js'
import logger from './logger'
import { TelegrafContext } from './types/telegraf'

export const bot = new Telegraf(env.BOT_TOKEN)

bot.telegram.getMe()
  .then(botInfo => {
    bot.options.username = botInfo.username
  })

bot.use(async (ctx: TelegrafContext, next) => {
  const startTime = Date.now()
  await next()
  const endTime = Date.now()
  console.log(`update ${ctx.update.update_id} processed in ${endTime - startTime} ms`)
})

bot.use(logger)

bot.startPolling()
