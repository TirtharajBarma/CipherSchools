import { useDispatch } from 'react-redux'
import { FiPlay } from 'react-icons/fi'

const DemoModeButton = () => {
  const dispatch = useDispatch()

  const handleDemoMode = () => {
    const demoUser = {
      id: 'demo-' + Date.now(),
      username: 'demo_user',
      email: 'demo@cipherstudio.com'
    }
    localStorage.setItem('user', JSON.stringify(demoUser))
    localStorage.setItem('authToken', 'demo-token-' + Date.now())
    window.location.reload()
  }

  return (
    <div className="mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Server offline?
          </span>
        </div>
      </div>
      
      <button
        onClick={handleDemoMode}
        className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-orange-300 dark:border-orange-600 rounded-xl text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200"
      >
        <FiPlay className="mr-2" size={16} />
        Try Demo Mode
      </button>
    </div>
  )
}

export default DemoModeButton