import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      console.warn('MONGODB_URI not set')
      return
    }

    // If already connected in this process, skip.
    if (mongoose.connection.readyState === 1) return

    mongoose.connection.once('connected', () => {
      console.log('MongoDB connected')
    })

    await mongoose.connect(uri, { bufferCommands: false })
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    throw error
  }
}

export default connectDB
