import mongoose from 'mongoose'
import env from '../../env.js'
import { User } from './schemas/User.js'
import { Tweet } from './schemas/Tweet.js'

const { createConnection } = mongoose

const connection = createConnection(env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true
})

connection.then(() => {
  console.log('DB connected')
})

connection.catch(e => {
  console.log('DB error', e)
})

const collections = [
  {
    name: 'tweets',
    schema: Tweet
  },
  {
    name: 'users',
    schema: User
  }
]

collections.forEach(collection => {
  if (collection.pre) {
    Object.keys(collection.pre).forEach(preKey => {
      collection.schema.pre(preKey, collection.pre[preKey])
    })
  }
  if (collection.method) {
    collection.schema.method(collection.method)
  }
  if (collection.virtual) {
    Object.keys(collection.virtual).forEach(virtual => {
      collection.schema.virtual(virtual, collection.virtual[virtual])
    })
  }
  connection.model(collection.name, collection.schema)
})

export const getCollection = collectionName => {
  const collection = collections.find(el => el.name === collectionName)
  if (collection) {
    return connection.model(collection.name, collection.schema)
  } else {
    throw new Error('Collection not found')
  }
}

export default getCollection
