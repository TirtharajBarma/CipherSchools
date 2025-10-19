import { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FiFile, FiPlus, FiTrash2, FiFolder, FiEdit3, FiCheck, FiX, FiFolderPlus, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import { createFile, deleteFile, setActiveFile, renameFile, deleteFolder, renameFolder } from '../store/slices/projectSlice'

const Sidebar = ({ width, onClose }) => {
  const dispatch = useDispatch()
  const { files, activeFile } = useSelector(state => state.project)
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renaming, setRenaming] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [expanded, setExpanded] = useState({ '/': true, '/src': true, '/public': true })
  const [selectedFolder, setSelectedFolder] = useState('/')
  const [renamingFolder, setRenamingFolder] = useState(null)
  const [renameFolderValue, setRenameFolderValue] = useState('')

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const base = (selectedFolder || '/').replace(/\/$/, '')
      const fileName = newFileName.startsWith('/') ? newFileName : `${base}/${newFileName}`
      dispatch(createFile({ fileName, code: '' }))
      setNewFileName('')
      setShowNewFileInput(false)
    }
  }

  const handleCreateFolder = () => {
    const name = newFolderName.trim().replace(/^\/+|\/+$/g, '')
    if (!name) return setShowNewFolderInput(false)
    // Creating a folder is virtual; ensure it appears by adding a placeholder .gitkeep
    const base = (selectedFolder || '/').replace(/\/$/, '')
    const filePath = `${base}/${name}/.gitkeep`
    if (!files[filePath]) {
      // Create placeholder without switching active file to .gitkeep
      dispatch(createFile({ fileName: filePath, code: '', activate: false }))
    }
    setNewFolderName('')
    setShowNewFolderInput(false)
  }

  const handleDeleteFile = (fileName) => {
    if (Object.keys(files).length > 1) {
      dispatch(deleteFile(fileName))
    }
  }

  const startRename = (fileName) => {
    setRenaming(fileName)
    setRenameValue(fileName.replace('/', ''))
  }

  const commitRename = (oldName) => {
    const cleaned = renameValue.trim()
    if (!cleaned) return setRenaming(null)
    const newName = cleaned.startsWith('/') ? cleaned : `/${cleaned}`
    if (newName !== oldName) {
      dispatch(renameFile({ oldName, newName }))
    }
    setRenaming(null)
  }

  // Build a tree from flat files for VS Code-like view
  const tree = useMemo(() => {
    const root = { name: '', type: 'folder', children: {} }
    Object.keys(files).forEach((full) => {
      const parts = full.replace(/^\//, '').split('/')
      let node = root
      parts.forEach((part, idx) => {
        const isFile = idx === parts.length - 1
        if (!node.children[part]) {
          node.children[part] = isFile
            ? { name: part, type: 'file', path: `/${parts.slice(0, idx + 1).join('/')}` }
            : { name: part, type: 'folder', children: {} }
        }
        node = node.children[part]
      })
    })
    return root
  }, [files])

  const toggleExpand = (key) =>
    setExpanded((prev) => {
      const isOpen = (prev[key] ?? true)
      return { ...prev, [key]: !isOpen }
    })

  const renderNode = (node, parentKey = '') => {
    if (node.type === 'file') {
      // Hide virtual placeholder files from view
      if (node.name === '.gitkeep') return null
      const fileName = node.path
      return (
        <div
          key={fileName}
          className={`flex items-center justify-between pl-7 pr-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
            activeFile === fileName ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
          }`}
          onClick={() => handleFileClick(fileName)}
        >
          <div className="flex items-center flex-1 min-w-0">
            <FiFile className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" size={14} />
            {renaming === fileName ? (
              <input
                className="text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-1 py-0.5 w-full"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(fileName)
                  if (e.key === 'Escape') setRenaming(null)
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span className="text-sm text-gray-900 dark:text-white truncate">{node.name}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {renaming === fileName ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); commitRename(fileName) }} className="p-1 text-green-600 hover:text-green-700" title="Save name"><FiCheck size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); setRenaming(null) }} className="p-1 text-gray-400 hover:text-gray-600" title="Cancel"><FiX size={12} /></button>
              </>
            ) : (
              <>
                <button onClick={(e) => { e.stopPropagation(); startRename(fileName) }} className="p-1 text-gray-400 hover:text-gray-600" title="Rename File"><FiEdit3 size={12} /></button>
                {Object.keys(files).length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(fileName) }} className="p-1 text-gray-400 hover:text-red-500" title="Delete File"><FiTrash2 size={12} /></button>
                )}
              </>
            )}
          </div>
        </div>
      )
    }

    // Folder
    const path = `${parentKey}/${node.name}`.replace(/\\/g, '/').replace(/\/\//g, '/') || '/'
    const open = expanded[path] ?? true
    const children = Object.values(node.children)
    return (
      <div key={path}>
        <div className="flex items-center justify-between px-2 py-1 select-none">
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => { toggleExpand(path); setSelectedFolder(path === '//' ? '/' : path) }}
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
              <FiFolder className="mx-2" size={14} />
              {renamingFolder === path ? (
                <input
                  className="text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-1 py-0.5 w-full"
                  value={renameFolderValue}
                  onChange={(e) => setRenameFolderValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const base = parentKey || '/'
                      const cleaned = renameFolderValue.trim().replace(/^\/+|\/+$/g, '')
                      if (cleaned) {
                        const next = `${base}/${cleaned}`.replace(/\\/g, '/').replace(/\/\//g, '/')
                        dispatch(renameFolder({ oldPath: path, newPath: next }))
                      }
                      setRenamingFolder(null)
                    }
                    if (e.key === 'Escape') setRenamingFolder(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span className="text-xs font-medium tracking-wide">{node.name || 'root'}</span>
              )}
            </button>
          </div>
          {node.name && (
            <div className="flex items-center gap-1">
              {renamingFolder === path ? (
                <>
                  <button onClick={(e) => { e.stopPropagation(); const base = parentKey || '/'; const cleaned = renameFolderValue.trim().replace(/^\/+|\/+$/g, ''); if (cleaned) { const next = `${base}/${cleaned}`.replace(/\\/g, '/').replace(/\/\//g, '/'); dispatch(renameFolder({ oldPath: path, newPath: next })) } setRenamingFolder(null) }} className="p-1 text-green-600 hover:text-green-700" title="Save"><FiCheck size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setRenamingFolder(null) }} className="p-1 text-gray-400 hover:text-gray-600" title="Cancel"><FiX size={12} /></button>
                </>
              ) : (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setRenamingFolder(path); setRenameFolderValue(node.name) }} className="p-1 text-gray-400 hover:text-gray-600" title="Rename Folder"><FiEdit3 size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); dispatch(deleteFolder(path.replace(/^\//, ''))) }} className="p-1 text-gray-400 hover:text-red-500" title="Delete Folder"><FiTrash2 size={12} /></button>
                </>
              )}
            </div>
          )}
        </div>
        {open && (
          <div className="ml-3">
            {children.map((child) => renderNode(child, path))}
          </div>
        )}
      </div>
    )
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
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <FiFolder className="mr-2" />
            Explorer
          </h3>
          <button
            onClick={() => {
              setShowNewFileInput((v) => !v)
              setShowNewFolderInput(false)
            }}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="New File"
          >
            <FiPlus size={16} />
          </button>
          <button
            onClick={() => {
              setShowNewFolderInput((v) => !v)
              setShowNewFileInput(false)
            }}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="New Folder"
          >
            <FiFolderPlus size={16} />
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
              placeholder={`${(selectedFolder || '/').replace(/\/$/, '')}/Component.jsx`}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>
        )}

        {showNewFolderInput && (
          <div className="mt-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              onBlur={() => setShowNewFolderInput(false)}
              placeholder={`${(selectedFolder || '/').replace(/\/$/, '')}/new-folder`}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {renderNode(tree)}
      </div>
    </div>
  )
}

export default Sidebar