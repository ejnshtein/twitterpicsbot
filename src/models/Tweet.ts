import { prop, modelOptions, getModelForClass } from '@typegoose/typegoose'
import { connection } from '../database'
import { Status } from 'twitter-d'

@modelOptions({
  existingConnection: connection,
  options: {
    customName: 'tweet'
  },
  schemaOptions: {
    id: false,
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: 'created_at'
    }
  }
})
export class Tweet {
  @prop({ required: false })
  public id: string

  @prop({ unique: true, required: true })
  public tweet_id: string

  @prop({ required: true })
  public tweet: Status

  @prop({ required: true, default: [] })
  public users: Array<number>
}

export const TweetModel = getModelForClass(Tweet)
