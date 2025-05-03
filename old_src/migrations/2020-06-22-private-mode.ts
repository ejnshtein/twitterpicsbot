import { UserModel } from '../models/User'

async function migrate () {
  const docs = await UserModel.find({ private_mode: { $exists: false } })
  let c = 0
  for (const doc of docs) {
    doc.private_mode = false
    c++
    await doc.save()
  }
  return c
}

migrate()
  .then(c => console.log(`Migrated ${c} documents`))
  .then(() => process.exit(1))
