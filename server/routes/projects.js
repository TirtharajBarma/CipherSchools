import express from 'express'
import Project from '../models/Project.js'

const router = express.Router()

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get project by ID
router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId })
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create new project
router.post('/', async (req, res) => {
  try {
    const { projectId, name, description, files, template } = req.body
    
    const project = new Project({
      projectId,
      name,
      description,
      files: files || [],
      template: template || 'react'
    })
    
    await project.save()
    res.status(201).json(project)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update project
router.put('/:projectId', async (req, res) => {
  try {
    const { name, description, files } = req.body
    
    const project = await Project.findOneAndUpdate(
      { projectId: req.params.projectId },
      { name, description, files },
      { new: true }
    )
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    res.json(project)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete project
router.delete('/:projectId', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ projectId: req.params.projectId })
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    
    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router