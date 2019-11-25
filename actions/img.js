const Composer = require('telegraf/composer')
const composer = new Composer()

const tweetLoader = require('../view/tweet-loader')

composer.action(/allimg:(\S+)\/([0-9]+)/i, async ctx => {
  const [_, username, tweetId] = ctx.match

  const { text, response } = await tweetLoader(tweetId, username)

  if (response.images.length > 1) {
    await ctx.replyWithMediaGroup(
      response.images.map((imgUrl, index) => ({
        type: 'photo',
        media: imgUrl,
        caption: index === 0 ? text : '',
        parse_mode: 'HTML'
      }))
    )
  }
  ctx.answerCbQuery('')
})

module.exports = composer.middleware()
