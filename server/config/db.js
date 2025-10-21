import mongoose from 'mongoose'

let lastMongoError = null

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
      lastMongoError = null
    })
    mongoose.connection.on('error', (err) => {
      lastMongoError = err
      console.error('MongoDB connection error event:', err?.message || err)
    })

    // Keep defaults (bufferCommands=true) so queries wait while connecting.
    // Add a reasonable timeout to surface errors in logs quickly.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  } catch (error) {
    lastMongoError = error
    console.error('MongoDB connection failed:', error?.message || error)
    throw error
  }
}

export const getMongoStatus = () => ({
  readyState: mongoose.connection.readyState,
  lastError: lastMongoError ? String(lastMongoError?.message || lastMongoError) : null,
})

export default connectDB
