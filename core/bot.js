import Telegraf from 'telegraf-esm'
import env from '../env.js'
import logger from './database/logger.js'

export const bot = new Telegraf(env.BOT_TOKEN)

bot.telegram.getMe()
  .then(botInfo => {
    bot.options.username = botInfo.username
  })

bot.use(logger)

bot.startPolling()
