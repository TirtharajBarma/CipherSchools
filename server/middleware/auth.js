import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('JWT_SECRET is not configured')
      return res.status(500).json({ error: 'Server misconfiguration' })
    }

    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }
  return jwt.sign({ userId }, secret, { expiresIn: '7d' })
}