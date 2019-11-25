module.exports = bot => {
  const actions = [
    './inline-query',
    './tweet-ear',
    './img'
  ]

  actions.forEach(action => {
    bot.use(require(action))
  })
}
