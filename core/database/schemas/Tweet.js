import mongoose from 'mongoose'

const { Schema } = mongoose

export const Tweet = new Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  tweet: {
    type: Object,
    required: true
  },
  users: {
    type: [Number],
    required: true
  }
}, {
  timestamps: {
    updatedAt: 'updated_at',
    createdAt: 'created_at'
  }
})
