// import { disconnectDatabase } from "./queue-api.js"

// shut down server
export async function shutdown () {
  // await disconnectDatabase()

  process.exit(0)
}

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint () {
  console.info(
    'Got SIGINT (aka ctrl-c in docker). Graceful shutdown ',
    new Date().toISOString()
  )
  shutdown()
})

// quit properly on docker stop
process.on('SIGTERM', function onSigterm () {
  console.info(
    'Got SIGTERM (docker container stop). Graceful shutdown ',
    new Date().toISOString()
  )
  shutdown()
})
