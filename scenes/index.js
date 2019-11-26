module.exports = bot => {
  const scenes = [
    './group-tweets'
  ]

  scenes.forEach(scene => {
    bot.use(require(scene))
  })
}
