import express from 'express'
import User from '../models/User.js'

const router = express.Router()

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('projects')
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('projects')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    const user = new User({
      username,
      email,
      password // In production, hash this password
    })
    
    await user.save()
    
    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password
    
    res.status(201).json(userResponse)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { username, email } = req.body
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true }
    ).select('-password')
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router