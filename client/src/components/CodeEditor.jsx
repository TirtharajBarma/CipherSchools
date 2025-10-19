import { useSelector, useDispatch } from 'react-redux'
import { updateFileCode } from '../store/slices/projectSlice'
import Editor from '@monaco-editor/react'

const CodeEditor = () => {
  const dispatch = useDispatch()
  const { files, activeFile } = useSelector(state => state.project)
  const { isDark } = useSelector(state => state.theme)

  const handleCodeChange = (value) => {
    if (activeFile && value !== undefined) {
      dispatch(updateFileCode({ fileName: activeFile, code: value }))
    }
  }

  const getLanguage = (fileName) => {
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return 'javascript'
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'typescript'
    if (fileName.endsWith('.css')) return 'css'
    if (fileName.endsWith('.html')) return 'html'
    if (fileName.endsWith('.json')) return 'json'
    return 'javascript'
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
        <Editor
          height="100%"
          language={getLanguage(activeFile)}
          value={files[activeFile].code}
          onChange={handleCodeChange}
          theme={isDark ? 'vs-dark' : 'vs-light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            contextmenu: true,
            selectOnLineNumbers: true,
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'line',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading editor...</p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}

export default CodeEditor