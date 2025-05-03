import { TweetModel } from '../models/Tweet'

async function migrate () {
  const { n } = await TweetModel.updateMany({}, { $set: { users: [] } })
  return n
}

migrate()
  .then(c => console.log(`Migrated ${c} documents`))
  .then(() => process.exit(1))
