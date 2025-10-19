import { apiConfig } from '../config/api.js'

const API_BASE_URL = apiConfig.baseURL

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken()
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }

      // Clear local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local storage even if server request fails
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const token = this.getToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get user profile')
      }

      return data.user
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const token = this.getToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed')
      }

      // Update token in localStorage
      localStorage.setItem('authToken', data.token)

      return data.token
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken')
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken()
    const user = localStorage.getItem('user')
    return !!(token && user)
  }

  // Get stored user data
  getStoredUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  // Check if token is expired (basic check)
  isTokenExpired() {
    const token = this.getToken()
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }
}

export default new AuthService()