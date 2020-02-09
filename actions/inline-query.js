import { Composer } from 'telegraf-esm'
import { getTweet } from '../store/twitter.js'
import { bot } from '../core/bot.js'

const composer = new Composer()

const catchThrow = fn => async ctx => {
  if (fn.then) {
    try {
      await fn(ctx)
    } catch (e) {
      return ctx.answerInlineQuery(sendError(e))
    }
  } else {
    try {
      fn(ctx)
    } catch (e) {
      return ctx.answerInlineQuery(sendError(e))
    }
  }
}

const getVideo = video => {
  const { url, content_type } = video.video_info.variants
    .filter(({ content_type }) => content_type === 'video/mp4')
    .pop()

  return { video_url: url, mime_type: content_type }
}

composer.inlineQuery(
  [
    /twitter\.com\/\S+\/status\/([0-9]+)/i,
    /^\S+\/([0-9]+)$/i,
    /^([0-9]+)$/i
  ],
  catchThrow(async ctx => {
    const [_, tweetId] = ctx.match

    const { error, tweet, type, wait } = await getTweet({ tweetId, fromId: ctx.from.id })

    console.log(tweet)

    const send = {
      photo: async (tweet) => {
        const images = tweet.extended_entities.media
          .filter(({ type }) => type === 'photo')
          .map((photo) => ({
            type: 'photo',
            photo_url: photo.media_url_https,
            thumb_url: photo.media_url_https,
            id: photo.id_str,
            caption: `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>`,
            parse_mode: 'HTML'
          }))
        const options = {
          cache_time: 30
        }
        if (images.length > 1) {
          options.switch_pm_text = 'Get as an album'
          options.switch_pm_parameter = `${tweetId}`
        }
        return ctx.answerInlineQuery(images, options)
      },
      videos: async (tweet) => {
        const videos = tweet.extended_entities.media
          .filter(({ type }) => type === 'video')
          .map((video) => {
            const { mime_type, video_url } = getVideo(video)
            return {
              type: 'video',
              video_url,
              mime_type,
              thumb_url: video.media_url_https,
              title: `${tweet.user.name}`,
              id: video.id_str,
              caption: `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>`,
              parse_mode: 'HTML'
            }
          })
        console.log(videos)
        const options = {
          cache_time: 30
        }
        if (videos.length > 1) {
          options.switch_pm_text = 'Get as an album'
          options.switch_pm_parameter = `${tweetId}`
        }
        return ctx.answerInlineQuery(videos, options)
      },
      gifs: async (tweet) => {
        const gifs = tweet.extended_entities.media
          .filter(({ type }) => type === 'animated_gif')
          .map((gif) => {
            return {
              type: 'gif',
              id: gif.id_str,
              gif_url: gif.video_info.variants.pop().url,
              thumb_url: gif.media_url_https,
              title: `${tweet.user.name}`,
              caption: `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>`,
              parse_mode: 'HTML'
            }
          })
        const options = {
          cache_time: 30
        }
        if (gifs.length > 1) {
          options.switch_pm_text = 'Get as an album'
          options.switch_pm_parameter = `${tweetId}`
        }
        return ctx.answerInlineQuery(gifs, options)
      }
    }

    if (error) {
      throw error
    }

    if (type === 'limit exceeded') {
      throw new Error(`Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} minutes`)
    }

    if (
      !tweet.extended_entities ||
      tweet.extended_entities.media.length === 0
    ) {
      return ctx.answerInlineQuery([])
    }

    const isSome = mediaType => tweet.extended_entities.media.some(({ type }) => type === mediaType)

    if (isSome('photo')) {
      return send.albums(tweet)
    }

    if (isSome('animated_gif')) {
      return send.gifs(tweet)
    }

    if (isSome('video')) {
      return send.videos(tweet)
    }
  }))

composer.on(
  'inline_query',
  catchThrow(async ctx => {
    if (ctx.inlineQuery.offset === 'none') {
      return ctx.answerInlineQuery([])
    }
    const query = {
      users: ctx.from.id,
      'tweet.extended_entities.media': { $exists: true }
    }
    const { query: userQuery } = ctx.inlineQuery
    let textSearch = `${userQuery}`
    if (userQuery.startsWith('videos')) {
      query['tweet.extended_entities.media'] = { $elemMatch: { type: 'video' } }
      textSearch = textSearch
        .replace('videos', '')
        .replace(/^\s/i, '')
    } else if (userQuery.startsWith('gifs')) {
      query['tweet.extended_entities.media'] = { $elemMatch: { type: 'animated_gif' } }
      textSearch = textSearch
        .replace('gif', '')
        .replace(/^\s/i, '')
    } else if (userQuery.startsWith('photos')) {
      query['tweet.extended_entities.media'] = { $elemMatch: { type: 'photo' } }
      textSearch = textSearch
        .replace('photos', '')
        .replace(/^\s/i, '')
    }
    query['tweet.user.screen_name'] = new RegExp(textSearch, 'i')
    const skip = Number.parseInt(ctx.inlineQuery.offset) || 0

    const result = await ctx.db('tweets')
      .find(query)
      .limit(12)
      .skip(skip * 12)
      .sort('-_id')
      .exec()

    const options = {
      cache_time: 5,
      is_personal: false,
      next_offset: result.length < 12 ? 'none' : `${skip + 1}`
    }

    const send = {
      photos: async () => {
        const images = result.reduce(
          (acc, { tweet }) => {
            return acc.concat(tweet.extended_entities.media
              .filter(({ type }) => type === 'photo')
              .map((photo) => ({
                type: 'photo',
                photo_url: photo.media_url_https,
                thumb_url: photo.media_url_https + '?format=jpg&name=small',
                id: photo.id_str,
                title: `${tweet.user.name}`,
                caption: `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>`,
                parse_mode: 'HTML'
              })))
          },
          []
        )
        return ctx.answerInlineQuery(images, options)
      },
      videos: async () => {
        const videos = result.reduce(
          (acc, { tweet }) => {
            return acc.concat(tweet.extended_entities.media
              .filter(({ type }) => type === 'video')
              .map((video) => {
                const { mime_type, video_url } = getVideo(video)
                return {
                  type: 'video',
                  video_url,
                  mime_type,
                  thumb_url: video.media_url_https,
                  title: `${tweet.user.name}`,
                  video_duration: Math.floor(video.video_info.duration_millis / 1000),
                  description: tweet.text,
                  id: video.id_str,
                  caption: `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>`,
                  parse_mode: 'HTML'
                }
              })
            )
          },
          [])
        return ctx.answerInlineQuery(videos, options)
      },
      gifs: async () => {
        const gifs = result.reduce(
          (acc, { tweet }) => {
            return acc.concat(tweet.extended_entities.media
              .filter(({ type }) => type === 'animated_gif')
              .map((gif) => {
                return {
                  type: 'gif',
                  id: gif.id_str,
                  gif_url: gif.video_info.variants.pop().url,
                  thumb_url: gif.media_url_https,
                  title: `${tweet.user.name}`,
                  caption: `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.name}</a>`,
                  parse_mode: 'HTML'
                }
              })
            )
          },
          [])
        return ctx.answerInlineQuery(gifs, options)
      }
    }
    const isSome = mediaType => result.some(({ tweet }) => tweet.extended_entities.media.some(({ type }) => type === mediaType))

    if (isSome('photo')) {
      return send.photos()
    }
    if (isSome('video')) {
      return send.videos()
    }
    if (isSome('animated_gif')) {
      return send.gifs()
    }
    return ctx.answerInlineQuery([])
  }))

const sendError = error => [
  {
    type: 'article',
    id: '1',
    title: 'Error!',
    description: `Something went wrong... ${error.message}`,
    input_message_content: {
      message_text: `Something went wrong... ${error.message}`
    }
  }
]

bot.use(composer.middleware())
