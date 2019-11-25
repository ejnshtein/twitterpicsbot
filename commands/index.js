module.exports = bot => {
  const commands = [
    './start'
  ]

  commands.forEach(command => {
    bot.use(require(command))
  })
}
