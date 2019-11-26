const Composer = require('telegraf/composer')
const composer = new Composer()

const tweetLoader = require('../view/tweet-loader')
const { onlyPrivate } = require('../middlewares')

composer.start(onlyPrivate, async ctx => {
  if (/^\S+_[0-9]+$/i.test(ctx.startPayload)) {
    const [_, username, tweetId] = ctx.startPayload.match(/^(\S+)_([0-9]+)$/i)
    const { text, response } = await tweetLoader(tweetId, username)
    if (response.images.length >= 1) {
      return ctx.replyWithMediaGroup(
        response.images.map((imgUrl, index) => ({
          type: 'photo',
          media: imgUrl,
          caption: index === 0 ? text : '',
          parse_mode: 'HTML'
        }))
      )
    }
  }
  return ctx.reply(
    'Hello! Send me link to tweet to start working!',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Use inline mode',
              switch_inline_query_current_chat: ''
            }
          ],
          [
            {
              text: 'Grab some tweets from Twitter',
              url: 'https://twitter.com'
            }
          ]
        ]
      }
    }
  )
})

module.exports = composer.middleware()
