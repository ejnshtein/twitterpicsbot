import { Composer } from 'telegraf-esm'

import tweetLoader from '../view/tweet-loader.js'
import { templates, sleep } from '../lib/index.js'
import { onlyPrivate } from '../middlewares/index.js'
import { bot } from '../core/bot.js'

const composer = new Composer()

const sendTweets = async ({
  chat,
  reply,
  message,
  telegram,
  replyWithMediaGroup
}) => {
  const tweets = message.text.match(/twitter\.com\/.+\/status\/[0-9]+/ig)
    .map(tweet => tweet.match(/twitter\.com\/(\S+)\/status\/([0-9]+)/i))
  const parsedTweets = []

  const originalTweetsLength = tweets.length

  let msg

  try {
    msg = await reply(`Processing ${tweets.length} tweet${tweets.length > 1 ? 's' : ''}...`)
  } catch (e) {
    return reply(templates.error(e))
  }

  for (const [_, username, tweetId] of tweets) {
    try {
      const { response } = await tweetLoader(tweetId, username)
      parsedTweets.push(response)
      await sleep(600)
    } catch (e) {
      console.log(e)
      return reply(templates.error(e))
    }
  }

  const albums = parsedTweets
    .filter(tweet => tweet.images.length)
    .reduce(
      (acc, tweet, index) => {
        if (acc.length) {
          if (acc[acc.length - 1].images.length <= 10 && acc[acc.length - 1].images.length + tweet.images.length <= 10) {
            const lastAlbum = acc[acc.length - 1]
            const lastImgId = lastAlbum.images.length
            lastAlbum.images = lastAlbum.images.concat(tweet.images)
            lastAlbum.caption += `\n<a href="${tweet.url}">${lastImgId + 1}${tweet.images.length > 1 ? `-${lastImgId + tweet.images.length}` : ''} ${tweet.title}</a>`
          } else {
            acc.push(
              {
                images: tweet.images.map(image => ({ url: image, filename: 'image' })),
                caption: `<a href="${tweet.url}">1${tweet.images.length > 1 ? `-${tweet.images.length}` : ''} ${tweet.title}</a>`
              }
            )
          }
        } else {
          acc.push(
            {
              images: tweet.images.map(image => ({ url: image, filename: 'image' })),
              caption: `<a href="${tweet.url}">1${tweet.images.length > 1 ? `-${tweet.images.length}` : ''} ${tweet.title}</a>`
            }
          )
        }
        return acc
      },
      []
    )
  const sentTweetsLength = parsedTweets
    .filter(tweet => tweet.images.length)
    .length

  const getLostTweets = () => parsedTweets
    .filter(tweet => !tweet.title)
    .map(tweet => tweet.url)
    .join('\n')

  const messageText = `
Received ${originalTweetsLength} tweet${originalTweetsLength > 1 ? 's' : ''}
Sent ${sentTweetsLength} tweet${sentTweetsLength > 1 ? 's' : ''}
Your success - ${((sentTweetsLength / originalTweetsLength) * 100).toFixed(0)}%
${originalTweetsLength - sentTweetsLength > 0 ? `Lost tweets:\n${getLostTweets()}` : ''}
  `

  for (const album of albums) {
    try {
      await replyWithMediaGroup(
        album.images.map((image, index) => ({
          type: 'photo',
          media: image,
          caption: index === 0 ? album.caption : undefined,
          parse_mode: 'HTML'
        }))
      )

      await sleep(1000)
    } catch (e) {
      return reply(templates.error(e))
    }
  }

  try {
    await reply(
      messageText,
      {
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'ok',
                callback_data: 'delete'
              }
            ],
            ...(
              originalTweetsLength - sentTweetsLength > 0 ? [
                [
                  {
                    text: 'Resend lost tweets',
                    callback_data: 'tweets'
                  }
                ]
              ] : []
            )
          ]
        }
      })
  } catch (e) {
    return reply(templates.error(e))
  }

  return telegram.deleteMessage(chat.id, msg.message_id)
}

// Echo scene
composer
  .hears(
    /twitter\.com\/\S+\/status\/[0-9]+/i,
    onlyPrivate,
    async (ctx) => {
      return sendTweets({
        chat: ctx.chat,
        reply: ctx.reply,
        message: ctx.message,
        telegram: ctx.telegram,
        replyWithMediaGroup: ctx.replyWithMediaGroup
      })
    }
  )
  .action(
    'tweets',
    onlyPrivate,
    async (ctx) => {
      try {
        await ctx.answerCbQuery('')
        await sendTweets({
          chat: ctx.chat,
          reply: ctx.reply,
          message: ctx.callbackQuery.message,
          telegram: ctx.telegram,
          replyWithMediaGroup: ctx.replyWithMediaGroup
        })
        await ctx.deleteMessage()
      } catch (e) {
        return ctx.reply(templates.error(e))
      }
    }
  )

bot.use(composer.middleware())
