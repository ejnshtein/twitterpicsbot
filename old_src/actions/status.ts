import { Composer } from 'telegraf'
import { formatDuration, intervalToDuration } from 'date-fns'
import { formatToTimeZone } from 'date-fns-timezone'
import { bot } from '../bot'
import { TelegrafContext } from '../types/telegraf'
import { UserModel } from '../models/User'
import { TweetModel } from '../models/Tweet'
import { templates } from '../lib/templates'

const uptime = (): string => {
  const duration = intervalToDuration({
    start: Date.now() - Math.floor(process.uptime() * 1000),
    end: Date.now()
  })
  const format = Object.entries(duration)
    .filter(([_, value]) => value > 0)
    .map(([name]) => name)
  if (format.length === 0) {
    format.push('seconds')
  }
  return formatDuration(
    duration,
    {
      format,
      zero: true
    }
  )
}

const ramusage = (): string => {
  const ram = process.memoryUsage()
  return (ram.heapTotal / 1e6).toFixed(2)
}

type Usage = {
  tweet: number
  user: number
}

const tgusage = async (): Promise<Usage> => ({
  user: await UserModel.estimatedDocumentCount(),
  tweet: await TweetModel.estimatedDocumentCount()
})

const statusmessage = async (): Promise<string> => {
  let text = ''
  text += `<b>Ram usage:</b> ${ramusage()} MB\n`
  text += `<b>Uptime:</b> ${uptime()}\n`
  text += `<b>Server time:</b> ${formatToTimeZone(
    new Date(),
    'YYYY-MM-DD hh:mm:ss.SSS',
    { timeZone: 'Europe/Berlin' }
)} UTC\n`
  const { user, tweet } = await tgusage()
  text += `<b>In use by</b> ${user} user(s)\n`
  text += `<b>Saved</b> ${tweet} tweet(s)`
  return text
}

const composer = new Composer()

composer
  .command(
    'status',
    async (ctx: TelegrafContext) => {
      try {
        const message = await statusmessage()
        await ctx.reply(
          message,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Update',
                    callback_data: 'status'
                  }
                ]
              ]
            }
          }
        )
      } catch (e) {
        return ctx.reply(templates.error(e))
      }
    }
  )
  .action(
    'status',
    async (ctx: TelegrafContext) => {
      try {
        const message = await statusmessage()
        await ctx.editMessageText(
          message,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Update',
                    callback_data: 'status'
                  }
                ]
              ]
            }
          }
        )
        await ctx.answerCbQuery('')
      } catch (e) {
        return ctx.answerCbQuery(templates.error(e), true)
      }
    }
  )

bot.use(composer.middleware())
