import { Composer } from 'telegraf'
import { bot } from '../bot'
import { UserModel } from '../models/User'
import { TelegrafContext } from '../types/telegraf'

const composer = new Composer()

const infoButton = [
  {
    text: 'Info',
    callback_data: 'settings:privatemodeinfo'
  }
]
const disablePrivateModeButton = [
  {
    text: 'Disable private mode',
    callback_data: 'settings:privateoff'
  }
]
const enablePrivateModeButton = [
  {
    text: 'Enable private mode',
    callback_data: 'settings:privateon'
  }
]

composer
  .command(
    'privateon',
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        await UserModel.updateOne(
          { id: ctx.from.id },
          {
            $set: {
              private_mode: true
            }
          }
        )
        return ctx.reply(
          'Private mode enabled.',
          {
            reply_markup: {
              inline_keyboard: [
                disablePrivateModeButton,
                infoButton
              ]
            }
          }
        )
      }
    )
  )
  .action(
    'settings:privateon',
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        await UserModel.updateOne(
          { id: ctx.from.id },
          {
            $set: {
              private_mode: true
            }
          }
        )
        await ctx.editMessageReplyMarkup(
          {
            inline_keyboard: [
              disablePrivateModeButton,
              infoButton
            ]
          }
        )
        return ctx.answerCbQuery('Private mode enabled.')
      }
    )
  )
  .command(
    'privateoff',
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        await UserModel.updateOne(
          { id: ctx.from.id },
          {
            $set: {
              private_mode: false
            }
          }
        )
        return ctx.reply(
          'Private mode disabled.',
          {
            reply_markup: {
              inline_keyboard: [
                enablePrivateModeButton,
                infoButton
              ]
            }
          }
        )
      }
    )
  )
  .action(
    'settings:privateoff',
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        await UserModel.updateOne(
          { id: ctx.from.id },
          {
            $set: {
              private_mode: false
            }
          }
        )
        await ctx.editMessageReplyMarkup(
          {
            inline_keyboard: [
              enablePrivateModeButton,
              infoButton
            ]
          }
        )
        return ctx.answerCbQuery('Private mode disabled.')
      }
    )
  )
  .action(
    'settings:privatemodeinfo',
    Composer.privateChat(
      async (ctx: TelegrafContext) => {
        return ctx.answerCbQuery(
          'When Private mode is on tweets that you send to bot and in inline mode will not be added to your tweets history.',
          true
        )
      }
    )
  )

bot.use(composer.middleware())
