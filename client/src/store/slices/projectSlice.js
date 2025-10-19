import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const defaultFiles = {
  '/public/index.html': {
    code: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CipherStudio App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
  </html>`
  },
  '/src/index.css': {
    code: `body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
h1 { margin: 0 0 8px; }
.container { padding: 20px; }`
  },
  '/src/App.jsx': {
    code: `import React from 'react';

export default function App() {
  return (
    <div className="container">
      <h1>Hello CipherStudio!</h1>
      <p>Start building your React app here.</p>
    </div>
  );
}`,
    active: true
  },
  '/src/main.jsx': {
    code: `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`
  },
  '/package.json': {
    code: `{
  "name": "cipherstudio-app",
  "private": true,
  "version": "0.1.0",
  "dependencies": { "react": "18.2.0", "react-dom": "18.2.0" }
}`
  }
}

// Normalize path: keep casing, trim whitespace around segments, ensure leading '/'
function normalizePath(name) {
  if (!name) return '/'
  const parts = String(name)
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
  return '/' + parts.join('/')
}

// Helpers for project metadata list
const PROJECT_LIST_KEY = 'project-list'
const getProjectList = () => {
  try { return JSON.parse(localStorage.getItem(PROJECT_LIST_KEY)) || [] } catch { return [] }
}
const setProjectList = (arr) => localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(arr))

const getInitialState = () => {
  const currentId = localStorage.getItem('currentProjectId')
  let files = null
  if (currentId) {
    const byId = localStorage.getItem(`project-${currentId}-files`)
    if (byId) {
      try { files = JSON.parse(byId) } catch {}
    }
  }
  if (!files) {
    const legacy = localStorage.getItem('project-files')
    if (legacy) {
      try { files = JSON.parse(legacy) } catch {}
    }
  }
  files = files || defaultFiles
  const activeFile = Object.keys(files)[0] || '/src/App.jsx'

  return {
    projectId: currentId || uuidv4(),
    files,
    activeFile,
    projectName: 'My React Project',
    autoSave: true,
  }
}

const initialState = getInitialState()

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    createFile: (state, action) => {
      const { fileName, code = '', activate = true } = action.payload
      const path = normalizePath(fileName)
      state.files[path] = { code, active: false }
      if (activate) state.activeFile = path
      if (state.autoSave) {
        localStorage.setItem('project-files', JSON.stringify(state.files))
        localStorage.setItem(`project-${state.projectId}-files`, JSON.stringify(state.files))
      }
    },
    deleteFile: (state, action) => {
      const fileName = normalizePath(action.payload)
      delete state.files[fileName]
      if (state.activeFile === fileName) {
        state.activeFile = Object.keys(state.files)[0] || null
      }
      if (state.autoSave) {
        localStorage.setItem('project-files', JSON.stringify(state.files))
        localStorage.setItem(`project-${state.projectId}-files`, JSON.stringify(state.files))
      }
    },
    deleteFolder: (state, action) => {
      let folderPath = normalizePath(action.payload)
      if (!folderPath) return
      // Remove trailing slash
      folderPath = folderPath.replace(/\/$/, '')
      const keys = Object.keys(state.files)
      keys.forEach((k) => {
        if (k === folderPath || k.startsWith(folderPath + '/')) {
          delete state.files[k]
        }
      })
      if (state.activeFile && (state.activeFile === folderPath || state.activeFile.startsWith(folderPath + '/'))) {
        state.activeFile = Object.keys(state.files)[0] || null
      }
      if (state.autoSave) {
        localStorage.setItem('project-files', JSON.stringify(state.files))
        localStorage.setItem(`project-${state.projectId}-files`, JSON.stringify(state.files))
      }
    },
    renameFile: (state, action) => {
      const { oldName, newName } = action.payload
      const oldPath = normalizePath(oldName)
      const nextPath = normalizePath(newName)
      if (!state.files[oldPath]) return
      if (oldPath === nextPath) return
      if (state.files[nextPath]) return
      state.files[nextPath] = state.files[oldPath]
      delete state.files[oldPath]
      if (state.activeFile === oldPath) state.activeFile = nextPath
      if (state.autoSave) {
        localStorage.setItem('project-files', JSON.stringify(state.files))
        localStorage.setItem(`project-${state.projectId}-files`, JSON.stringify(state.files))
      }
    },
    renameFolder: (state, action) => {
      let { oldPath, newPath } = action.payload || {}
      if (!oldPath || !newPath) return
      oldPath = normalizePath(oldPath).replace(/\/$/, '')
      newPath = normalizePath(newPath).replace(/\/$/, '')
      if (oldPath === newPath) return
      const keys = Object.keys(state.files)
      const updated = {}
      keys.forEach((k) => {
        if (k === oldPath || k.startsWith(oldPath + '/')) {
          const suffix = k.slice(oldPath.length)
          const nk = newPath + suffix
          updated[nk] = state.files[k]
        } else {
          updated[k] = state.files[k]
        }
      })
      state.files = updated
      if (state.activeFile && (state.activeFile === oldPath || state.activeFile.startsWith(oldPath + '/'))) {
        state.activeFile = state.activeFile.replace(oldPath, newPath)
      }
      if (state.autoSave) {
        localStorage.setItem('project-files', JSON.stringify(state.files))
        localStorage.setItem(`project-${state.projectId}-files`, JSON.stringify(state.files))
      }
    },
    setActiveFile: (state, action) => {
      state.activeFile = normalizePath(action.payload)
    },
    updateFileCode: (state, action) => {
      const { fileName, code } = action.payload
      const path = normalizePath(fileName)
      if (state.files[path]) {
        state.files[path].code = code
        if (state.autoSave) {
          localStorage.setItem('project-files', JSON.stringify(state.files))
          localStorage.setItem(`project-${state.projectId}-files`, JSON.stringify(state.files))
        }
      }
    },
    saveProject: (state) => {
      localStorage.setItem('project-files', JSON.stringify(state.files))
      localStorage.setItem(`project-${state.projectId}-files`, JSON.stringify(state.files))
      localStorage.setItem('currentProjectId', state.projectId)
      // update metadata list
      const list = getProjectList()
      const idx = list.findIndex(p => p.id === state.projectId)
      const meta = { id: state.projectId, name: state.projectName, updatedAt: Date.now() }
      if (idx >= 0) list[idx] = meta; else list.push(meta)
      setProjectList(list)
    },
    loadProject: (state, action) => {
      const { projectId } = action.payload
      const savedFiles = localStorage.getItem(`project-${projectId}-files`)
      if (savedFiles) {
        state.files = JSON.parse(savedFiles)
        state.projectId = projectId
        state.activeFile = Object.keys(state.files)[0] || null
      }
    },
    createNewProject: (state) => {
      const id = uuidv4()
      state.projectId = id
      state.projectName = 'My React Project'
      state.files = defaultFiles
      state.activeFile = Object.keys(state.files)[0]
      localStorage.setItem('currentProjectId', id)
      localStorage.setItem(`project-${id}-files`, JSON.stringify(state.files))
      localStorage.setItem('project-files', JSON.stringify(state.files))
      const list = getProjectList()
      list.push({ id, name: state.projectName, updatedAt: Date.now() })
      setProjectList(list)
    },
    createNewProjectWithName: (state, action) => {
      const id = uuidv4()
      state.projectId = id
      state.projectName = action.payload?.name || 'Untitled Project'
      state.files = defaultFiles
      state.activeFile = Object.keys(state.files)[0]
      localStorage.setItem('currentProjectId', id)
      localStorage.setItem(`project-${id}-files`, JSON.stringify(state.files))
      localStorage.setItem('project-files', JSON.stringify(state.files))
      const list = getProjectList()
      list.push({ id, name: state.projectName, updatedAt: Date.now() })
      setProjectList(list)
    },
    selectProjectById: (state, action) => {
      const id = action.payload
      const savedFiles = localStorage.getItem(`project-${id}-files`)
      if (savedFiles) {
        state.projectId = id
        state.files = JSON.parse(savedFiles)
        state.activeFile = Object.keys(state.files)[0]
        localStorage.setItem('currentProjectId', id)
      }
    },
    deleteProjectById: (state, action) => {
      const id = action.payload
      localStorage.removeItem(`project-${id}-files`)
      const list = getProjectList().filter(p => p.id !== id)
      setProjectList(list)
      if (state.projectId === id) {
        // Move to a fresh project
        const fallback = list[list.length - 1]
        if (fallback) {
          const saved = localStorage.getItem(`project-${fallback.id}-files`)
          state.projectId = fallback.id
          state.projectName = fallback.name
          state.files = saved ? JSON.parse(saved) : defaultFiles
          state.activeFile = Object.keys(state.files)[0]
          localStorage.setItem('currentProjectId', fallback.id)
        } else {
          // No projects left
          state.projectId = uuidv4()
          state.projectName = 'My React Project'
          state.files = defaultFiles
          state.activeFile = Object.keys(state.files)[0]
          localStorage.removeItem('currentProjectId')
        }
      }
    },
    clearAllLocalProjects: (state) => {
      // Dev utility: clear all app storage
      Object.keys(localStorage)
        .filter(k => k.startsWith('project-') || k === 'currentProjectId' || k === 'project-files' || k === PROJECT_LIST_KEY)
        .forEach(k => localStorage.removeItem(k))
      state.projectId = uuidv4()
      state.projectName = 'My React Project'
      state.files = defaultFiles
      state.activeFile = Object.keys(state.files)[0]
    },
    toggleAutoSave: (state) => {
      state.autoSave = !state.autoSave
    },
    setProjectName: (state, action) => {
      state.projectName = action.payload
      const list = getProjectList()
      const idx = list.findIndex(p => p.id === state.projectId)
      if (idx >= 0) { list[idx].name = state.projectName; list[idx].updatedAt = Date.now(); setProjectList(list) }
    },
    initializeProject: (state) => {
      // Ensure we have at least one file and it's active
      if (Object.keys(state.files).length === 0) {
        state.files = defaultFiles
      }
      // Normalize all stored keys (trims accidental spaces/duplicate slashes)
      const normalized = {}
      Object.entries(state.files).forEach(([k, v]) => {
        const nk = normalizePath(k)
        normalized[nk] = v
      })
      state.files = normalized
      if (!state.activeFile || !state.files[state.activeFile]) {
        // Try normalized active file
        const naf = normalizePath(state.activeFile)
        state.activeFile = state.files[naf] ? naf : Object.keys(state.files)[0]
      }
      // Persist normalized state if autosave is on
      if (state.autoSave) {
        localStorage.setItem('project-files', JSON.stringify(state.files))
        localStorage.setItem(`project-${state.projectId}-files`, JSON.stringify(state.files))
      }
    }
  },
})

export const { 
  createFile, 
  deleteFile, 
  setActiveFile, 
  updateFileCode, 
  saveProject, 
  loadProject, 
  toggleAutoSave,
  setProjectName,
  initializeProject,
  renameFile,
  createNewProject,
  createNewProjectWithName,
  selectProjectById,
  deleteProjectById,
  clearAllLocalProjects,
  deleteFolder,
  renameFolder
} = projectSlice.actions

export default projectSlice.reducer