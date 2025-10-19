import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateToken, authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    // Return user data without password
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = generateToken(user._id)

    // Return user data without password
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResponse = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      createdAt: req.user.createdAt
    }

    res.json({ user: userResponse })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Logout (client-side token removal, but we can track it server-side if needed)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const newToken = generateToken(req.user._id)
    res.json({ token: newToken })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router