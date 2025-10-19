import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Sidebar from './components/Sidebar'
import IDELayout from './components/IDELayout'
import Header from './components/Header'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import DebugInfo from './components/DebugInfo'
import ProjectDashboard from './components/ProjectDashboard'
import { getCurrentUser } from './store/slices/authSlice'
import { initializeProject } from './store/slices/projectSlice'
import authService from './services/authService'

function App() {
  const dispatch = useDispatch()
  const { isDark } = useSelector(state => state.theme)
  const { activeFile } = useSelector(state => state.project)
  const { isAuthenticated, loading } = useSelector(state => state.auth)
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated() && !authService.isTokenExpired()) {
        try {
          await dispatch(getCurrentUser()).unwrap()
          dispatch(initializeProject())
        } catch (error) {
          console.error('Failed to get current user:', error)
          // If server is down, still allow offline mode with stored user
          const storedUser = authService.getStoredUser()
          if (storedUser) {
            dispatch(initializeProject())
          }
        }
      } else {
        // Check if we have a stored user for offline mode
        const storedUser = authService.getStoredUser()
        if (storedUser) {
          dispatch(initializeProject())
        }
      }
    }
    
    checkAuth()
  }, [dispatch])

  // Initialize project when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Only initialize if a current project exists, else show dashboard
      const hasCurrent = !!localStorage.getItem('currentProjectId')
      if (hasCurrent) dispatch(initializeProject())
    }
  }, [isAuthenticated, dispatch])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center ${isDark ? 'dark' : ''} bg-white dark:bg-gray-900`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show beautiful auth pages if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={isDark ? 'dark' : ''}>
        {authMode === 'login' ? (
          <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />
        ) : (
          <SignupPage onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    )
  }

  // No current project selected -> show dashboard
  if (!localStorage.getItem('currentProjectId')) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <ProjectDashboard />
      </div>
    )
  }

  return (
    <div className={`h-screen w-screen flex flex-col ${isDark ? 'dark' : ''} bg-white dark:bg-gray-900 overflow-hidden`}>
      <Header onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar width={sidebarWidth} />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowMobileSidebar(false)} />
            <div className="relative">
              <Sidebar width={250} onClose={() => setShowMobileSidebar(false)} />
            </div>
          </div>
        )}
        
        {/* Main IDE Area - No extra wrapper */}
        {activeFile ? (
          <IDELayout />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to CipherStudio
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Select a file from the sidebar to start coding
              </p>
            </div>
          </div>
        )}
      </div>
      
      <DebugInfo />
    </div>
  )
}

export default App