import { parseTweet } from '../parser/index.js'

export default async (tweetId, username, options = { description: false }) => {
  const res = await parseTweet(`https://twitter.com/${username || 'elonmusk'}/status/${tweetId}`)

  return {
    photo: res.images.length ? res.images[0] : undefined,
    video: res.video,
    text: `${
      res.video
      ? `<a href="${res.url}">&#8203;</a>`
      : ''}<a href="${res.url}">${res.title}</a>${options.description ? `\n\n${res.description}` : ''}`,
    response: res
  }
}
