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

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('MongoDB connected successfully')
    } else {
      console.log('MongoDB URI not provided, running without database')
    }
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }
}

connectDB()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})