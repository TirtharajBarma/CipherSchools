import { useSelector, useDispatch } from 'react-redux'
import { updateFileCode } from '../store/slices/projectSlice'

const CodeEditor = () => {
  const dispatch = useDispatch()
  const { files, activeFile } = useSelector(state => state.project)
  const { isDark } = useSelector(state => state.theme)

  const handleCodeChange = (e) => {
    if (activeFile) {
      dispatch(updateFileCode({ fileName: activeFile, code: e.target.value }))
    }
  }

  if (!activeFile || !files[activeFile]) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">No file selected</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 flex-shrink-0">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {activeFile.replace('/', '')}
        </span>
      </div>
      
      <div className="flex-1 min-h-0">
        <textarea
          value={files[activeFile].code}
          onChange={handleCodeChange}
          className="w-full h-full p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none border-none outline-none"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.5',
            tabSize: 2
          }}
          spellCheck={false}
          placeholder="Start coding..."
        />
      </div>
    </div>
  )
}

export default CodeEditor