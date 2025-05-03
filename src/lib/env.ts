import { envsafe, str, num } from 'envsafe'

export const env = envsafe({
  NODE_ENV: str({
    devDefault: 'development',
    choices: ['development', 'production']
  }),
  TOKEN: str(),
  ADMIN_ID: num(),
  TELEGRAM_BOT_API: str({
    devDefault: 'http://local-telegram-bot-api:8081'
  })
})
