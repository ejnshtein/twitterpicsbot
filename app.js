require('./env')
const bot = require('./core/bot')

require('./actions')(bot)
require('./commands')(bot)
