import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FiSun, FiMoon, FiSave, FiUser, FiLogOut, FiLogIn, FiMenu, FiGrid, FiTrash, FiZap } from 'react-icons/fi'
import { toggleTheme } from '../store/slices/themeSlice'
import { saveProject, toggleAutoSave, clearAllLocalProjects, saveProjectToServer } from '../store/slices/projectSlice'
import { logoutUser, showAuthModal } from '../store/slices/authSlice'
import AISettings from './AISettings'

const Header = ({ onToggleSidebar }) => {
  const dispatch = useDispatch()
  const { isDark } = useSelector(state => state.theme)
  const { projectName, autoSave, projectId } = useSelector(state => state.project)
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const [showAISettings, setShowAISettings] = useState(false)

  return (
    <header className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <FiMenu size={18} />
        </button>
  <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">CipherStudio</h1>
  <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">{projectName}</span>
  <span className="hidden lg:block text-xs text-gray-500 dark:text-gray-500">ID: {projectId}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => dispatch(toggleAutoSave())}
          className={`px-3 py-1 text-xs rounded ${
            autoSave 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}
          title="Auto-save continuously (ON) or only when you click Save (OFF)"
        >
          Auto-save: {autoSave ? 'ON' : 'OFF'}
        </button>
        
        <button
          onClick={() => { dispatch(saveProject()); dispatch(saveProjectToServer()) }}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title="Save Project"
        >
          <FiSave size={18} />
        </button>

        <button
          onClick={() => { localStorage.removeItem('currentProjectId'); window.location.reload() }}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title="Open Projects Dashboard"
        >
          <FiGrid size={18} />
        </button>

        {/* Dev helper: clear local storage */}
        <button
          onClick={() => { dispatch(clearAllLocalProjects()); window.location.reload() }}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          title="Clear Storage (dev)"
        >
          <FiTrash size={18} />
        </button>
        
        <button
          onClick={() => setShowAISettings(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
          title="AI Assistant Settings"
        >
          <FiZap size={18} />
        </button>

        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          title="Toggle Theme"
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              <FiUser size={14} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{user?.username}</span>
            </div>
            <button
              onClick={() => dispatch(logoutUser())}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Logout"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => dispatch(showAuthModal('login'))}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            <FiLogIn size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* AI Settings Modal */}
      {showAISettings && <AISettings onClose={() => setShowAISettings(false)} />}
    </header>
  )
}

export default Header