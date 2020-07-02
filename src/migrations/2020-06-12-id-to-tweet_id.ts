import { TweetModel } from '../models/Tweet'

async function migrate () {
  const docs = await TweetModel.find({ tweet_id: { $exists: false } })
  let c = 0
  for (const doc of docs) {
    if (!doc.tweet_id) {
      doc.tweet_id = doc.toObject().id
      c++
      await doc.save()
    }
  }
  return c
}

migrate()
  .then(c => console.log(`Migrated ${c} documents`))
  .then(() => process.exit(1))
