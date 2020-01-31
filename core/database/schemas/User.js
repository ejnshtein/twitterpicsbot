import mongoose from 'mongoose'

const { Schema } = mongoose

export const User = new Schema({
  id: {
    type: Number,
    unique: true
  },
  username: {
    type: String,
    required: false
  },
  first_name: {
    type: String,
    required: false
  },
  last_name: {
    type: String,
    required: false
  },
  tweets: {
    type: [String],
    required: true,
    default: []
  }
}, {
  timestamps: {
    updatedAt: 'updated_at',
    createdAt: 'created_at'
  }
})
