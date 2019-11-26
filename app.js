require('./env')
const bot = require('./core/bot')

require('./scenes')(bot)
require('./actions')(bot)
require('./commands')(bot)
