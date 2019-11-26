const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')

const tweetLoader = require('../view/tweet-loader')
const { templates, sleep } = require('../lib')

const composer = new Composer()

const { enter, leave } = Stage

// Echo scene
const groupTweets = new Scene('group-tweets')
groupTweets.enter((ctx) => ctx.reply('Send me a few tweets links to group them into an album!\n\nSend /cancel to cancel'))
groupTweets.leave((ctx) => ctx.reply('Ok'))
groupTweets.command('cancel', leave())
groupTweets.hears(
  /twitter\.com\/\S+\/status\/[0-9]+/i,
  async (ctx) => {
    const tweets = ctx.message.text.match(/twitter\.com\/.+\/status\/[0-9]+/ig)
      .map(tweet => tweet.match(/twitter\.com\/(\S+)\/status\/([0-9]+)/i))
    const parsedTweets = []

    let msg

    try {
      msg = await ctx.reply(`Processing ${tweets.length} tweet${tweets.length > 1 ? 's' : ''}...`)
    } catch {}

    for (const [_, username, tweetId] of tweets) {
      try {
        parsedTweets.push((await tweetLoader(tweetId, username)).response)
        await sleep(300)
      } catch (e) {
        return ctx.reply(templates.error(e))
      }
    }

    const albums = parsedTweets
      .filter(tweet => tweet.images.length)
      .reduce(
        (acc, tweet, index) => {
          if (acc.length) {
            if (acc[acc.length - 1].images.length < 10 && acc[acc.length - 1].images.length + tweet.images.length < 10) {
              const lastAlbum = acc[acc.length - 1]
              const lastImgId = lastAlbum.images.length
              lastAlbum.images = lastAlbum.images.concat(tweet.images)
              lastAlbum.caption += `, <a href="${tweet.url}">${lastImgId + 1}${tweet.images.length > 1 ? `-${lastImgId + tweet.images.length + 1}` : ''} sauce</a>`
            }
          } else {
            acc.push(
              {
                images: tweet.images,
                caption: `<a href="${tweet.url}">1${tweet.images.length > 1 ? `-${tweet.images.length}` : '' } sauce</a>`
              }
            )
          }
          return acc
        },
        []
      )

    for (const album of albums) {
      try {
        await ctx.replyWithMediaGroup(
          album.images.map((image, index) => ({
            type: 'photo',
            media: image,
            caption: index === 0 ? album.caption : undefined,
            parse_mode: 'HTML'
          }))
        )

        await sleep(1000)
      } catch (e) {
        return ctx.reply(templates.error(e))
      }
    }
    leave(ctx)
    return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, 'Done', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'ok',
              callback_data: 'delete'
            }
          ]
        ]
      }
    })
  }
)

const stage = new Stage([groupTweets], { ttl: 30 })
composer.use(session())
composer.use(stage.middleware())

composer.command('group', ctx => ctx.scene.enter('group-tweets'))

module.exports = composer.middleware()
