module.exports = bot => {
  const actions = [
    './inline-query',
    './tweet-ear',
    './img',
    './delete'
  ]

  actions.forEach(action => {
    bot.use(require(action))
  })
}
