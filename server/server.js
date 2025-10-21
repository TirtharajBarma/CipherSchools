import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB, { getMongoStatus } from './config/db.js'
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

// Health + diagnostics
app.get('/api/health', async (req, res) => {
  // try to establish connection if not yet connected
  try { await connectDB() } catch (_) {}
  res.json({
    ok: true,
    env: {
      vercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV || 'development',
      hasMongoURI: !!process.env.MONGODB_URI,
      hasJwt: !!process.env.JWT_SECRET,
    },
    mongoState: mongoose.connection.readyState,
    mongoDetail: getMongoStatus(),
  })
})

// Force a DB command to surface specific errors (auth/network)
app.get('/api/db-ping', async (req, res) => {
  try {
    await connectDB()
    const result = await mongoose.connection.db.admin().command({ ping: 1 })
    res.json({ ok: true, result })
  } catch (e) {
    res.status(500).json({
      ok: false,
      name: e?.name,
      message: e?.message,
      code: e?.code,
      error: String(e),
    })
  }
})

app.get('/', (req, res) => {
  res.json({ message: 'CipherStudio API Server' })
})

// Simple one-time connect (on cold start)
connectDB().catch((e) => console.error('MongoDB connection error:', e))

// Only start a listener locally. On Vercel, the builder invokes the exported app as a handler.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app