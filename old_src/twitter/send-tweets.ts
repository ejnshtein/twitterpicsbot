import { getTweet } from './get-tweet'
import { TelegrafContext } from '../types/telegraf'
import sleep from '../lib/sleep'
import getVideoUrl, { VideoData } from '../lib/get-video-url'
import { FullUser } from 'twitter-d'
import { InputFile, InlineKeyboardButton, ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { getThumbUrl } from '../lib/get-thumb-url'
import { templates } from '../lib/templates'

type onLimitExceededArguments = {
  tweets: string[][]
  wait: number
}

export const onLimitExceeded = ({ tweets, wait }: onLimitExceededArguments): string => {
  const text = `Exceeded the number of requests, please wait ${Math.floor(wait / 1000)} ms.`
  return `${text}\n\nTweets list:\n${tweets.map(([url]) => url).join('\n')}`
}

export type InputMedia = {
  type: string
  thumb: string
  url: string | VideoData
}

type Options = {
  text?: string
  tweetIds?: string[]
  messageId?: number
}

type Result = {
  _: 'album' | 'gif' | 'error'
  ids: string[]
  media?: InputMedia[]
  caption?: string
  error?: Error
}
export const findLastIndex = (
  arr: Result[],
  fn: (val: Result, i: number, arr: Result[]) => boolean
): any => (arr
  .map((val, i) => [i, val])
  .filter((res: [number, Result]) => {
    const [i, val] = res
    return fn(val, i, arr)
  })
  .pop() || [-1]
)[0]

export const sendTweets = async (ctx: TelegrafContext, { text, tweetIds, messageId }: Options): Promise<void> => {
  const {
    chat,
    from,
    state,
    reply,
    telegram,
    replyWithMediaGroup,
    replyWithAnimation
  } = ctx
  const results: Result[] = []
  const sentTweets: string[] = []

  const tweets = text
    ? text.match(/twitter\.com\/.+\/status\/[0-9]+/ig)
      .map(tweet => tweet.match(/twitter\.com\/\S+\/status\/([0-9]+)/i))
    : tweetIds
      .map(tweetId => [`https://twitter.com/web/status/${tweetId}`, tweetId])

  const originalTweetsLength = tweets.length

  const initialOptions: ExtraReplyMessage = {}
  if (messageId) {
    initialOptions.reply_to_message_id = messageId
  }
  const msg = await reply(
    `Processing ${tweets.length} tweet${tweets.length > 1 ? 's' : ''}...`,
    initialOptions
  )
  for (const [_, tweetId] of tweets) {
    const { error, tweet, type, wait } = await getTweet({
      tweetId,
      fromId: from.id,
      privateMode: state.user.private_mode
    })

    switch (type) {
      case 'error': {
        results.push({
          _: 'error',
          ids: [tweetId],
          error
        })
        break
      }
      case 'limit exceeded': {
        throw new Error(
          onLimitExceeded({ tweets, wait })
        )
      }
    }

    const entities = tweet.extended_entities

    const isInMedia = (mediaType: string) => entities.media.some(
      ({ type }) => type === mediaType
    )

    const user = tweet.user as FullUser
    if (isInMedia('photo')) {
      const images = entities.media
        .filter(({ type }) => type === 'photo')
        .map(
          image => ({
            type: 'photo',
            thumb: getThumbUrl(image.media_url_https),
            url: getThumbUrl(image.media_url_https, 'medium')
          }) as InputMedia
        )
      const lastAlbumIndex = findLastIndex(results, el => el._ === 'album') as number
      const addNewAlbum = () => {
        results.push({
          _: 'album',
          ids: [tweetId],
          media: [].concat(images),
          caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweetId}">${images.length > 1 ? `1-${images.length}` : `${tweets.length > 1 ? '1' : ''}`} ${user.name}</a>`
        })
      }
      if (lastAlbumIndex >= 0) {
        const lastAlbum = results[lastAlbumIndex]
        if (
          lastAlbum.media.length >= 0 &&
          lastAlbum.media.length < 10 &&
          lastAlbum.media.length + images.length <= 10
        ) {
          const lastMediaId = lastAlbum.media.length
          lastAlbum.media = lastAlbum.media.concat(images)
          lastAlbum.ids.push(tweetId)
          lastAlbum.caption += `\n<a href="https://twitter.com/${user.screen_name}/status/${tweetId}">${lastMediaId + 1}${images.length > 1 ? `-${lastMediaId + images.length}` : ''} ${user.name}</a>`
        } else {
          addNewAlbum()
        }
      } else {
        addNewAlbum()
      }
    }
    if (isInMedia('video')) {
      const videos = entities.media
        .filter(({ type }) => type === 'video')
        .map(video => {
          const { video_url } = getVideoUrl(video.video_info)
          return {
            type: 'video',
            url: video_url,
            thumb: getThumbUrl(video.media_url_https)
          } as InputMedia
        })
      const lastAlbumIndex = findLastIndex(results, el => el._ === 'album') as number
      const addNewAlbum = () => {
        results.push({
          _: 'album',
          ids: [tweetId],
          media: [].concat(videos),
          caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweetId}">${videos.length > 1 ? `1-${videos.length}` : `${tweets.length > 1 ? '1' : ''}`} ${user.name}</a>`
        })
      }
      if (lastAlbumIndex >= 0) {
        const lastAlbum = results[lastAlbumIndex]
        if (
          lastAlbum.media.length >= 0 &&
          lastAlbum.media.length < 10 &&
          lastAlbum.media.length + videos.length <= 10
        ) {
          const lastMediaId = lastAlbum.media.length
          lastAlbum.media = lastAlbum.media.concat(videos)
          lastAlbum.ids.push(tweetId)
          lastAlbum.caption += `\n<a href="https://twitter.com/${user.screen_name}/status/${tweetId}">${lastMediaId + 1}${videos.length > 1 ? `-${lastMediaId + videos.length}` : `${tweets.length > 1 ? '1' : ''}`} ${user.name}</a>`
        } else {
          addNewAlbum()
        }
      } else {
        addNewAlbum()
      }
    }
    if (isInMedia('animated_gif')) {
      const gifs = entities.media
        .filter(({ type }) => type === 'animated_gif')
        .map(gif => ({
          type: 'gif',
          url: gif.video_info.variants.pop().url,
          thumb: getThumbUrl(gif.media_url_https)
        }) as InputMedia)
      for (const gif of gifs) {
        results.push({
          _: 'gif',
          ids: [tweetId],
          media: [gif],
          caption: `<a href="https://twitter.com/${user.screen_name}/status/${tweetId}">${user.name}</a>`
        })
      }
    }
  }

  for (const result of results.filter(({ _ }) => _ !== 'error')) {
    switch (result._) {
      case 'album': {
        await replyWithMediaGroup(
          result.media.map((m, index) => ({
            type: m.type,
            media: m.url as InputFile,
            caption: index === 0 ? result.caption : undefined,
            parse_mode: 'HTML'
          }))
        )
        break
      }
      case 'gif': {
        const { url, thumb } = result.media[0]
        const { caption } = result
        await replyWithAnimation(
          url as string,
          {
            caption,
            thumb,
            parse_mode: 'HTML'
          }
        )
        break
      }
    }
    result.ids.forEach(id => sentTweets.push(id))
    await sleep(1000)
  }
  for (const { error } of (results.filter(({ _ }) => _ === 'error'))) {
    await reply(templates.error(error))
    await sleep(1000)
  }
  const sentTweetsLength = sentTweets.length

  const getLostTweets = () => tweets
    .filter(([_, tweetId1]) => !sentTweets.some(tweetId => tweetId === tweetId1))
    .map(([_]) => _)
    .join('\n')

  const messageText = `
    Received ${originalTweetsLength} tweet${originalTweetsLength > 1 ? 's' : ''}
    Sent ${sentTweetsLength} tweet${sentTweetsLength > 1 ? 's' : ''}
    Your success - ${((sentTweetsLength / originalTweetsLength) * 100).toFixed(0)}%
    ${originalTweetsLength - sentTweetsLength > 0 ? `Lost tweets (Probably they do not contain photos, videos, gifs or API access can be disabled by author.):\n${getLostTweets()}` : ''}
    `
  const keyboard: InlineKeyboardButton[][] = [
    [
      {
        text: 'ok',
        callback_data: 'delete'
      },
      {
        text: 'Get as files',
        callback_data: 'getfiles'
      }
    ]
  ]
  if (originalTweetsLength - sentTweetsLength) {
    keyboard.push(
      [
        {
          text: 'Resend lost tweets',
          callback_data: 'tweets'
        }
      ]
    )
  }
  const finalOptions: ExtraReplyMessage = {
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: keyboard
    }
  }
  if (messageId) {
    finalOptions.reply_to_message_id = messageId
  }
  await reply(
    messageText,
    finalOptions
  )

  await telegram.deleteMessage(chat.id, msg.message_id)
}
