import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { createNewProjectWithName, selectProjectById, deleteProjectById } from '../store/slices/projectSlice'
import { FiFolderPlus, FiTrash2, FiPlay } from 'react-icons/fi'

const ProjectDashboard = () => {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const projects = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('project-list')) || [] } catch { return [] }
  }, [localStorage.getItem('project-list')])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={() => name.trim() && dispatch(createNewProjectWithName({ name: name.trim() }))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FiFolderPlus /> Create
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No projects yet. Create one to get started.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{p.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => dispatch(selectProjectById(p.id))} className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded inline-flex items-center gap-1"><FiPlay /> Open</button>
                    <button onClick={() => dispatch(deleteProjectById(p.id))} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded inline-flex items-center gap-1"><FiTrash2 /> Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDashboard
