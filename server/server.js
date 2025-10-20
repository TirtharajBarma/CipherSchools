import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import projectRoutes from './routes/projects.js'
import userRoutes from './routes/users.js'
import authRoutes from './routes/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5003

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/users', userRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'CipherStudio API Server' })
})

// Simple MongoDB connection (no serverless cache)
async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('MongoDB URI not provided, running without database')
    return
  }
  // Avoid duplicate connects in the same process
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(uri)
  console.log('MongoDB connected successfully')
}

connectDB().catch((e) => console.error('MongoDB connection error:', e))

// Only start a listener locally. On Vercel, the builder invokes the exported app as a handler.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app