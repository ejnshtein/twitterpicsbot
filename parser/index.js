import cheerio from 'cheerio'
import { request } from '../lib/index.js'

export const parseTweet = async (url) => {
  const { data: html } = await request(url, { method: 'GET' })

  const response = {}

  const dom = cheerio.load(html)

  const images = dom('head > meta[property="og:image"]').map((i, el) => el.attribs.content).get()

  if (images.length === 1 && !/media\/(\S+)\.\S+/i.test(images[0])) {
    images.pop()
  }
  response.title = dom('head > meta[property="og:title"]').attr('content')
  response.description = dom('head > meta[property="og:description"]').attr('content')
  response.images = images
  response.url = url

  if (dom('head > meta[property="og:video:url"]').attr('content')) {
    response.video = dom('head > meta[property="og:video:url"]').attr('content')
    response.video_width = dom('head > meta[property="og:video:width"]').attr('content')
    response.video_heigth = dom('head > meta[property="og:video:height"]').attr('content')
  }

  return response
}
