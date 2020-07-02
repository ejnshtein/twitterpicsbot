import Telegraf from 'telegraf'
import env from './env.js'
import logger from './logger'

export const bot = new Telegraf(env.BOT_TOKEN)

bot.telegram.getMe()
  .then(botInfo => {
    bot.options.username = botInfo.username
  })

bot.use(logger)

bot.startPolling()
