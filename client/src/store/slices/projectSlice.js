import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const defaultFiles = {
  '/App.js': {
    code: `export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>Hello CipherStudio!</h1>
      <p>Start building your React app here.</p>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Click me!
      </button>
    </div>
  );
}`,
    active: true
  },
  '/index.js': {
    code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
    active: false
  }
}

const getInitialState = () => {
  const savedFiles = JSON.parse(localStorage.getItem('project-files'))
  const files = savedFiles || defaultFiles
  const activeFile = Object.keys(files)[0] || '/App.js'
  
  return {
    projectId: localStorage.getItem('currentProjectId') || uuidv4(),
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
      const { fileName, code = '' } = action.payload
      state.files[fileName] = { code, active: false }
      state.activeFile = fileName
      if (state.autoSave) {
        localStorage.setItem('project-files', JSON.stringify(state.files))
      }
    },
    deleteFile: (state, action) => {
      const fileName = action.payload
      delete state.files[fileName]
      if (state.activeFile === fileName) {
        state.activeFile = Object.keys(state.files)[0] || null
      }
      if (state.autoSave) {
        localStorage.setItem('project-files', JSON.stringify(state.files))
      }
    },
    setActiveFile: (state, action) => {
      state.activeFile = action.payload
    },
    updateFileCode: (state, action) => {
      const { fileName, code } = action.payload
      if (state.files[fileName]) {
        state.files[fileName].code = code
        if (state.autoSave) {
          localStorage.setItem('project-files', JSON.stringify(state.files))
        }
      }
    },
    saveProject: (state) => {
      localStorage.setItem('project-files', JSON.stringify(state.files))
      localStorage.setItem('currentProjectId', state.projectId)
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
    toggleAutoSave: (state) => {
      state.autoSave = !state.autoSave
    },
    setProjectName: (state, action) => {
      state.projectName = action.payload
    },
    initializeProject: (state) => {
      // Ensure we have at least one file and it's active
      if (Object.keys(state.files).length === 0) {
        state.files = defaultFiles
      }
      if (!state.activeFile || !state.files[state.activeFile]) {
        state.activeFile = Object.keys(state.files)[0]
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
  initializeProject
} = projectSlice.actions

export default projectSlice.reducer