const cheerio = require('cheerio')
const { request } = require('../lib')

module.exports = {
  parseTweet: async (url) => {
    const { data: html } = await request(url, { method: 'GET' })

    const dom = cheerio.load(html)

    const images = dom('head > meta[property="og:image"]').map(function (i, el) {
      return el.attribs.content
    }).get()

    if (images.length === 1 && !/media\/(\S+)\.\S+/i.test(images[0])) {
      images.pop()
    }
    const response = {
      title: dom('head > meta[property="og:title"]').attr('content'),
      description: dom('head > meta[property="og:description"]').attr('content'),
      images,
      url: dom('head > meta[property="og:url"]').attr('content')
    }

    if (dom('head > meta[property="og:video:url"]').attr('content')) {
      response.video = dom('head > meta[property="og:video:url"]').attr('content')
      response.video_width = dom('head > meta[property="og:video:width"]').attr('content')
      response.video_heigth = dom('head > meta[property="og:video:height"]').attr('content')
    }

    return response
  }
}
