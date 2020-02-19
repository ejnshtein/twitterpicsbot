import { Composer } from 'telegraf-esm'
import { templates, sleep } from '../lib/index.js'
import { onlyPrivate } from '../middlewares/index.js'
import { bot } from '../core/bot.js'
import { getTweet } from '../store/twitter.js'

const composer = new Composer()

export const onLimitExceeded = ({ tweets, wait }) => {
  const text = `Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} ms.`
  return `${text}\n\nTweets list:\n${tweets.map(([url]) => url).join('\n')}`
}

const getVideoUrl = video => {
  const { url } = video.video_info.variants
    .filter(({ content_type }) => content_type === 'video/mp4')
    .pop()

  return url
}

const sendTweets = async ({
  chat,
  from,
  reply,
  message,
  telegram,
  replyWithMediaGroup,
  sendAnimation
}) => {
  const send = {
    albums: async (tweets) => {
      const albums = tweets
        .filter(tweet => tweet.extended_entities.media.some(({ type }) => type === 'photo'))
        .map(tweet => {
          tweet.extended_entities.media = tweet.extended_entities.media.filter(({ type }) => type === 'photo')
          return tweet
        })
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
                lastAlbum.caption += `\n<a href="https://twitter.com/${user.screen_name}/status/${id_str}">${lastImgId + 1}${images.length > 1 ? `-${lastImgId + images.length}` : ''} ${user.name}</a>`
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
    },
    gifs: async (tweets) => {
      const gifs = tweets
        .filter(tweet => tweet.extended_entities.media.some(({ type }) => type === 'animated_gif'))
        .map(tweet => {
          tweet.extended_entities.media = tweet.extended_entities.media.filter(({ type }) => type === 'animated_gif')
          return tweet
        })
        .reduce(
          (acc, tweet) => {
            return acc.concat(tweet.extended_entities.media.map(gif => ({
              url: gif.video_info.variants.pop().url,
              thumb: gif.media_url_https,
              caption: `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>`
            })))
          },
          []
        )
      for (const { url, thumb, caption } of gifs) {
        await sendAnimation(url, { caption, thumb, parse_mode: 'HTML' })
        await sleep(500)
      }
    },
    videos: async (tweets) => {
      const albums = tweets
        .filter(tweet => tweet.extended_entities.media.some(({ type }) => type === 'video'))
        .map(tweet => {
          tweet.extended_entities.media = tweet.extended_entities.media.filter(({ type }) => type === 'video')
          return tweet
        })
        .reduce(
          (acc, tweet) => {
            const videos = tweet.extended_entities.media.map(video => ({
              url: getVideoUrl(video),
              filename: 'video'
            }))
            const { user, id_str } = tweet
            const tw = {
              videos
            }
            if (acc.length) {
              if (acc[acc.length - 1].videos.length <= 10 && acc[acc.length - 1].videos.length + videos.length <= 10) {
                const lastAlbum = acc[acc.length - 1]
                const lastVideoId = lastAlbum.videos.length
                lastAlbum.videos = lastAlbum.videos.concat(videos)
                lastAlbum.caption += `\n<a href="https://twitter.com/${user.screen_name}/status/${id_str}">${lastVideoId + 1}${videos.length > 1 ? `-${lastVideoId + videos.length}` : ''} ${user.name}</a>`
              } else {
                tw.caption = `<a href="https://twitter.com/${user.screen_name}/status/${id_str}">1${videos.length > 1 ? `-${videos.length}` : ''} ${user.name}</a>`
                acc.push(tw)
              }
            } else {
              tw.caption = `<a href="https://twitter.com/${user.screen_name}/status/${id_str}">1${videos.length > 1 ? `-${videos.length}` : ''} ${user.name}</a>`
              acc.push(tw)
            }
            return acc
          },
          []
        )

      for (const album of albums) {
        await replyWithMediaGroup(
          album.videos.map((video, index) => ({
            type: 'video',
            media: video,
            caption: index === 0 ? album.caption : undefined,
            parse_mode: 'HTML'
          }))
        )
        await sleep(1000)
      }
    }
  }
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
        throw new Error(onLimitExceeded({ tweets, wait: response.wait }))
      }
      case response.type === 'error': {
        throw new Error(`Status ${tweetId} error: ${JSON.stringify(response.error)}`)
      }
    }
  }

  const tweetsWithMedia = receivedTweets
    .filter(tweet => tweet.extended_entities && tweet.extended_entities.media.length > 0)
    .filter(tweet => tweet.extended_entities.media.some(({ type }) => ['video', 'photo', 'animated_gif'].includes(type)))

  const isSome = mediaType => tweetsWithMedia.some(tweet => tweet.extended_entities.media.some(({ type }) => type === mediaType))

  if (isSome('photo')) {
    await send.albums(tweetsWithMedia)
  }

  if (isSome('animated_gif')) {
    await send.gifs(tweetsWithMedia)
  }

  if (isSome('video')) {
    await send.videos(tweetsWithMedia)
  }

  const sentTweetsLength = tweetsWithMedia.length

  const getLostTweets = () => tweets
    .filter(([_, tweetId]) => !tweetsWithMedia.some(tweet => tweet.id_str === tweetId))
    .map(([_]) => _)
    .join('\n')

  const messageText = `
    Received ${originalTweetsLength} tweet${originalTweetsLength > 1 ? 's' : ''}
    Sent ${sentTweetsLength} tweet${sentTweetsLength > 1 ? 's' : ''}
    Your success - ${((sentTweetsLength / originalTweetsLength) * 100).toFixed(0)}%
    ${originalTweetsLength - sentTweetsLength > 0 ? `Lost tweets (Probably they do not contain photos, videos or gifs.):\n${getLostTweets()}` : ''}
    `

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
    async ctx => {
      try {
        await sendTweets({
          chat: ctx.chat,
          from: ctx.from,
          reply: ctx.reply,
          message: ctx.message,
          telegram: ctx.telegram,
          replyWithMediaGroup: ctx.replyWithMediaGroup,
          sendAnimation: (animation, extra) => ctx.telegram.sendAnimation(ctx.chat.id, animation, extra)
        })
      } catch (e) {
        // console.log(JSON.stringify(e))
        return ctx.reply(templates.error(e), {
          reply_to_message_id: ctx.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Try again',
                  callback_data: 'tweets_retry'
                }
              ]
            ]
          }
        })
      }
    }
  )
  .action(
    'tweets',
    onlyPrivate,
    async ctx => {
      try {
        await sendTweets({
          chat: ctx.chat,
          from: ctx.from,
          reply: ctx.reply,
          message: ctx.callbackQuery.message,
          telegram: ctx.telegram,
          replyWithMediaGroup: ctx.replyWithMediaGroup,
          sendAnimation: (animation, extra) => ctx.telegram.sendAnimation(ctx.chat.id, animation, extra)
        })
        await ctx.answerCbQuery('')
        await ctx.deleteMessage()
      } catch (e) {
        return ctx.answerCbQuery(templates.error(e))
      }
    }
  )
  .action(
    'tweets_retry',
    onlyPrivate,
    async ctx => {
      try {
        await sendTweets({
          chat: ctx.chat,
          from: ctx.from,
          reply: ctx.reply,
          message: ctx.callbackQuery.message.reply_to_message,
          telegram: ctx.telegram,
          replyWithMediaGroup: ctx.replyWithMediaGroup,
          sendAnimation: (animation, extra) => ctx.telegram.sendAnimation(ctx.chat.id, animation, extra)
        })
        await ctx.answerCbQuery('')
        await ctx.deleteMessage()
      } catch (e) {
        return ctx.answerCbQuery(templates.error(e))
      }
    }
  )

bot.use(composer.middleware())
