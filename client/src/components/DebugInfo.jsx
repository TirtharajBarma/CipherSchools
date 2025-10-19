import { useSelector } from 'react-redux'

const DebugInfo = () => {
  const auth = useSelector(state => state.auth)
  const project = useSelector(state => state.project)
  const theme = useSelector(state => state.theme)

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Auth: {auth.isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {auth.user?.username || 'None'}</div>
        <div>Loading: {auth.loading ? '⏳' : '✅'}</div>
        <div>Error: {auth.error || 'None'}</div>
        <div>Files: {Object.keys(project.files).length}</div>
        <div>Active: {project.activeFile || 'None'}</div>
        <div>Theme: {theme.isDark ? '🌙' : '☀️'}</div>
      </div>
    </div>
  )
}

export default DebugInfo