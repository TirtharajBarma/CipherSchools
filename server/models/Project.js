import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'file'
  }
})

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  files: [fileSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  template: {
    type: String,
    default: 'react'
  }
}, {
  timestamps: true
})

export default mongoose.model('Project', projectSchema)