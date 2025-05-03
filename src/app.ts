// import '@src/handle-callback-query'
// import '@src/commands'

import { botClient } from './tg-api'

async function main () {
  console.log(await botClient.api.getMe())

  await Promise.all([
    botClient.api.setMyCommands([
      {
        command: 'uploadlastep',
        description: 'Upload last episode'
      },
      {
        command: 'cleanup',
        description: 'Cleanup tmp folder'
      }
    ])
  ])

  console.log('Ready!')
}

main()
