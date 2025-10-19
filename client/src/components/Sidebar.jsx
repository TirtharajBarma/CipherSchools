import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FiFile, FiPlus, FiTrash2, FiFolder } from 'react-icons/fi'
import { createFile, deleteFile, setActiveFile } from '../store/slices/projectSlice'

const Sidebar = ({ width, onClose }) => {
  const dispatch = useDispatch()
  const { files, activeFile } = useSelector(state => state.project)
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const fileName = newFileName.startsWith('/') ? newFileName : `/${newFileName}`
      dispatch(createFile({ fileName, code: '' }))
      setNewFileName('')
      setShowNewFileInput(false)
    }
  }

  const handleDeleteFile = (fileName) => {
    if (Object.keys(files).length > 1) {
      dispatch(deleteFile(fileName))
    }
  }

  const handleFileClick = (fileName) => {
    dispatch(setActiveFile(fileName))
    if (onClose) onClose() // Close mobile sidebar when file is selected
  }

  return (
    <div 
      className="bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full"
      style={{ width }}
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <FiFolder className="mr-2" />
            Files
          </h3>
          <button
            onClick={() => setShowNewFileInput(true)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="New File"
          >
            <FiPlus size={16} />
          </button>
        </div>
        
        {showNewFileInput && (
          <div className="mt-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
              onBlur={() => setShowNewFileInput(false)}
              placeholder="filename.js"
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {Object.keys(files).map((fileName) => (
          <div
            key={fileName}
            className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
              activeFile === fileName ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
            }`}
            onClick={() => handleFileClick(fileName)}
          >
            <div className="flex items-center flex-1 min-w-0">
              <FiFile className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" size={14} />
              <span className="text-sm text-gray-900 dark:text-white truncate">
                {fileName.replace('/', '')}
              </span>
            </div>
            
            {Object.keys(files).length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFile(fileName)
                }}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Delete File"
              >
                <FiTrash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar