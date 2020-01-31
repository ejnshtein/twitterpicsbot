import { Composer } from 'telegraf-esm'

import { templates, sleep } from '../lib/index.js'
import { onlyPrivate } from '../middlewares/index.js'
import { bot } from '../core/bot.js'
import { getTweet } from '../store/twitter.js'

const composer = new Composer()

export const onLimitExceeded = ({ tweets, wait }) => {
  const text = `Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} minutes.`
  return `${text}\n\nTweets list:\n${tweets.map(([url]) => url).join('\n')}`
}

const sendTweets = async ({
  chat,
  reply,
  message,
  telegram,
  replyWithMediaGroup
}) => {
  const tweets = message.text.match(/twitter\.com\/.+\/status\/[0-9]+/ig)
    .map(tweet => tweet.match(/twitter\.com\/\S+\/status\/([0-9]+)/i))
  const receivedTweets = []

  const originalTweetsLength = tweets.length

  let msg

  try {
    msg = await reply(`Processing ${tweets.length} tweet${tweets.length > 1 ? 's' : ''}...`)
  } catch (e) {
    return reply(templates.error(e))
  }

  for (const [_, tweetId] of tweets) {
    const response = await getTweet(tweetId)
    switch (true) {
      case response.ok: {
        receivedTweets.push(response.tweet)
        break
      }
      case response.type === 'limit exceeded': {
        return reply(
          onLimitExceeded({ tweets, wait: response.wait }),
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Resend tweets',
                    callback_data: 'tweets'
                  }
                ]
              ]
            }
          }
        )
      }
      case response.type === 'error': {
        console.log(response.error)
        return reply(templates.error(response.error))
      }
    }
  }

  const tweetsWithMedia = receivedTweets
    .filter(tweet => tweet.entities.media.length > 0 && tweet.entities.media.some(({ type }) => type === 'photo'))
    .map(tweet => {
      tweet.entities.media = tweet.entities.media.filter(({ type }) => type === 'photo')
      return tweet
    })

  const albums = tweetsWithMedia
    .reduce(
      (acc, { id_str, user, entities }, index) => {
        const images = entities.media.map(({ media_url_https }) => media_url_https)
        const tw = {
          images: images.map(image => ({ url: image, filename: 'image' })),
          caption: `<a href="https://twitter.com/${user.screen_name}/status/${id_str}">1-${images.length} ${user.name}</a>`
        }
        if (acc.length) {
          if (acc[acc.length - 1].images.length <= 10 && acc[acc.length - 1].images.length + images.length <= 10) {
            const lastAlbum = acc[acc.length - 1]
            const lastImgId = lastAlbum.images.length
            lastAlbum.images = lastAlbum.images.concat(images)
            lastAlbum.caption += `\n<a href="https://twitter.com/${user.screen_name}/status/${id_str}">${lastImgId + 1}${images.length > 1 ? `-${lastImgId + images.length}` : ''} ${user.name}</a>`
          } else {
            acc.push(tw)
          }
        } else {
          acc.push(tw)
        }
        return acc
      },
      []
    )
  const sentTweetsLength = tweetsWithMedia.length

  const getLostTweets = () => tweets
    .filter(([_, tweetId]) => receivedTweets.some(tweet => tweet.id_str !== tweetId))
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
