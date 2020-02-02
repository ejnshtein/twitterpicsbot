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
  from,
  reply,
  message,
  telegram,
  replyWithMediaGroup
}) => {
  const tweets = message.text.match(/twitter\.com\/.+\/status\/[0-9]+/ig)
    .map(tweet => tweet.match(/twitter\.com\/\S+\/status\/([0-9]+)/i))
  const receivedTweets = []

  const originalTweetsLength = tweets.length

  const msg = await reply(`Processing ${tweets.length} tweet${tweets.length > 1 ? 's' : ''}...`)

  for (const [_, tweetId] of tweets) {
    const response = await getTweet({ tweetId, fromId: from.id })
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
        throw response.error
      }
    }
  }

  const tweetsWithMedia = receivedTweets
    .filter(tweet => tweet.extended_entities && tweet.extended_entities.media.length > 0)
    .filter(tweet => tweet.extended_entities.media.some(({ type }) => type === 'photo'))
    .map(tweet => {
      tweet.extended_entities.media = tweet.extended_entities.media.filter(({ type }) => type === 'photo')
      return tweet
    })

  const albums = tweetsWithMedia
    .reduce(
      (acc, { id_str, user, extended_entities }, index) => {
        const images = extended_entities.media.map(({ media_url_https }) => media_url_https).map(image => ({ url: image, filename: 'image' }))
        const tw = {
          images
        }
        if (acc.length) {
          if (acc[acc.length - 1].images.length <= 10 && acc[acc.length - 1].images.length + images.length <= 10) {
            const lastAlbum = acc[acc.length - 1]
            const lastImgId = lastAlbum.images.length
            lastAlbum.images = lastAlbum.images.concat(images)
            lastAlbum.caption += `, <a href="https://twitter.com/${user.screen_name}/status/${id_str}">${lastImgId + 1}${images.length > 1 ? `-${lastImgId + images.length}` : ''} ${user.name}</a>`
          } else {
            tw.caption = `<a href="https://twitter.com/${user.screen_name}/status/${id_str}">1${images.length > 1 ? `-${images.length}` : ''} ${user.name}</a>`
            acc.push(tw)
          }
        } else {
          tw.caption = `<a href="https://twitter.com/${user.screen_name}/status/${id_str}">1${images.length > 1 ? `-${images.length}` : ''} ${user.name}</a>`
          acc.push(tw)
        }
        return acc
      },
      []
    )
  const sentTweetsLength = tweetsWithMedia.length

  const getLostTweets = () => tweets
    .filter(([_, tweetId]) => !tweetsWithMedia.some(tweet => tweet.id_str === tweetId))
    .map(([_]) => _)
    .join('\n')

  const messageText = `
Received ${originalTweetsLength} tweet${originalTweetsLength > 1 ? 's' : ''}
Sent ${sentTweetsLength} tweet${sentTweetsLength > 1 ? 's' : ''}
Your success - ${((sentTweetsLength / originalTweetsLength) * 100).toFixed(0)}%
${originalTweetsLength - sentTweetsLength > 0 ? `Lost tweets (Probably they do not contain photos.):\n${getLostTweets()}` : ''}
  `

  for (const album of albums) {
    await replyWithMediaGroup(
      album.images.map((image, index) => ({
        type: 'photo',
        media: image,
        caption: index === 0 ? album.caption : undefined,
        parse_mode: 'HTML'
      }))
    )
    await sleep(1000)
  }

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

  return telegram.deleteMessage(chat.id, msg.message_id)
}

// Echo scene
composer
  .hears(
    /twitter\.com\/\S+\/status\/[0-9]+/i,
    onlyPrivate,
    async (ctx) => {
      try {
        await sendTweets({
          chat: ctx.chat,
          from: ctx.from,
          reply: ctx.reply,
          message: ctx.message,
          telegram: ctx.telegram,
          replyWithMediaGroup: ctx.replyWithMediaGroup
        })
      } catch (e) {
        console.log(JSON.stringify(e))
        return ctx.reply(templates.error(e))
      }
    }
  )
  .action(
    'tweets',
    onlyPrivate,
    async (ctx) => {
      try {
        await sendTweets({
          chat: ctx.chat,
          from: ctx.from,
          reply: ctx.reply,
          message: ctx.callbackQuery.message,
          telegram: ctx.telegram,
          replyWithMediaGroup: ctx.replyWithMediaGroup
        })
        await ctx.answerCbQuery('')
        await ctx.deleteMessage()
      } catch (e) {
        return ctx.answerCbQuery(templates.error(e))
      }
    }
  )

bot.use(composer.middleware())
