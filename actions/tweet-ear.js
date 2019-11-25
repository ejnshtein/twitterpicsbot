const Composer = require('telegraf/composer')
const composer = new Composer()

const tweetLoader = require('../view/tweet-loader')

composer.hears(/twitter\.com\/(.+)\/status\/([0-9]+)/i, async ctx => {
  const [_, username, tweetId] = ctx.match
  const { photo, text, response } = await tweetLoader(tweetId, username, { description: true })

  try {
    await ctx.replyWithChatAction('upload_photo')
  } catch {}

  if (photo) {
    await ctx.replyWithPhoto(photo, {
      parse_mode: 'HTML',
      caption: text,
      reply_markup: {
        inline_keyboard: [
          response.images.length > 1
            ? [
              {
                text: `Load ${response.images.length} images`,
                callback_data: `allimg:${username}/${tweetId}`
              }
            ]
            : [],
          [
            {
              text: 'Share',
              switch_inline_query: `${username}/${tweetId}`
            }
          ]
        ]
      }
    })
  } else {
    await ctx.reply(text, {
      parse_mode: 'HTML'
    })
  }
})

module.exports = composer.middleware()
