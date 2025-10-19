import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createNewProjectWithName, selectProjectById, deleteProjectById, renameProjectById, createProjectAndPersist, deleteProjectOnServerAndLocal } from '../store/slices/projectSlice'
import { FiFolderPlus, FiTrash2, FiPlay, FiEdit3, FiCheck, FiX } from 'react-icons/fi'

const ProjectDashboard = () => {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const { projectsVersion } = useSelector((s) => s.project)
  const projects = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('project-list')) || [] } catch { return [] }
  }, [projectsVersion])
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

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
              onClick={() => name.trim() && dispatch(createProjectAndPersist({ name: name.trim() }))}
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
                  <div className="min-w-0">
                    {renamingId === p.id ? (
                      <input
                        className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const v = renameValue.trim()
                            if (v) dispatch(renameProjectById({ id: p.id, name: v }))
                            setRenamingId(null)
                          }
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-gray-100 font-medium truncate">{p.name}</div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renamingId === p.id ? (
                      <>
                        <button
                          onClick={() => { const v = renameValue.trim(); if (v) dispatch(renameProjectById({ id: p.id, name: v })); setRenamingId(null) }}
                          className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded inline-flex items-center gap-1"
                        ><FiCheck /> Save</button>
                        <button onClick={() => setRenamingId(null)} className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded inline-flex items-center gap-1"><FiX /> Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => dispatch(selectProjectById(p.id))} className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded inline-flex items-center gap-1"><FiPlay /> Open</button>
                        <button onClick={() => { setRenamingId(p.id); setRenameValue(p.name) }} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded inline-flex items-center gap-1"><FiEdit3 /> Rename</button>
                        <button onClick={() => dispatch(deleteProjectOnServerAndLocal(p.id))} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded inline-flex items-center gap-1"><FiTrash2 /> Delete</button>
                      </>
                    )}
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
