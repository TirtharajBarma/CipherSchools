import { apiConfig } from '../config/api.js'
import authService from './authService.js'

const API_BASE_URL = apiConfig.baseURL

class ProjectService {
  // Get authorization headers
  getAuthHeaders() {
    const token = authService.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Get all projects for current user
  async getAllProjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch projects')
      }

      return data
    } catch (error) {
      console.error('Get projects error:', error)
      throw error
    }
  }

  // Get project by ID
  async getProject(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch project')
      }

      return data
    } catch (error) {
      console.error('Get project error:', error)
      throw error
    }
  }

  // Create new project
  async createProject(projectData) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project')
      }

      return data
    } catch (error) {
      console.error('Create project error:', error)
      throw error
    }
  }

  // Update project
  async updateProject(projectId, projectData) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update project')
      }

      return data
    } catch (error) {
      console.error('Update project error:', error)
      throw error
    }
  }

  // Delete project
  async deleteProject(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete project')
      }

      return data
    } catch (error) {
      console.error('Delete project error:', error)
      throw error
    }
  }

  // Save project files (auto-save functionality)
  async saveProjectFiles(projectId, files) {
    try {
      const filesArray = Object.keys(files).map(fileName => ({
        name: fileName,
        content: files[fileName].code,
        type: 'file'
      }))

      return await this.updateProject(projectId, { files: filesArray })
    } catch (error) {
      console.error('Save project files error:', error)
      throw error
    }
  }
}

export default new ProjectService()