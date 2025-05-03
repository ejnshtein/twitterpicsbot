import { Bot } from 'grammy'
import { env } from './lib/env'

export const botClient = new Bot(env.TOKEN, {
  client: {
    apiRoot: env.TELEGRAM_BOT_API
  }
})

if (env.NODE_ENV !== 'production') {
  botClient.use(async (ctx, next) => {
    const startTime = Date.now()
    await next()
    const endTime = Date.now()
    console.log(
      `update ${ctx.update.update_id} processed in ${endTime - startTime} ms`
    )
  })
}

botClient.catch((err) => {
  console.error('Error:', err)
})
