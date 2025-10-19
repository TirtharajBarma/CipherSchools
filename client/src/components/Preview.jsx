import { useMemo, useState } from 'react'
import { SandpackProvider, SandpackPreview, SandpackLayout, SandpackConsole } from '@codesandbox/sandpack-react'
import { useSelector } from 'react-redux'
import { FiEye, FiRefreshCw } from 'react-icons/fi'

// Sandpack-based live preview that compiles the in-memory project using the
// CodeSandbox bundler. This supports React + multi-file imports reliably.
const Preview = () => {
  const { files } = useSelector((state) => state.project)
  const { isDark } = useSelector((state) => state.theme)
  const [refreshToken, setRefreshToken] = useState(0)

  // Map Redux files to Sandpack file shape. Ensure required entry files exist.
  const sandpackFiles = useMemo(() => {
    const mapped = {}
    if (files) {
      for (const [name, value] of Object.entries(files)) {
        const path = name.startsWith('/') ? name : `/${name}`
        mapped[path] = value?.code ?? ''
      }
    }

    if (!mapped['/src/App.jsx']) {
      mapped['/src/App.jsx'] = `export default function App(){
  return (<div style={{padding:20,fontFamily:'system-ui'}}>
    <h1>Hello CipherStudio</h1>
    <p>Edit /App.js to get started.</p>
  </div>)
}`
    }
    if (!mapped['/src/main.jsx']) {
      mapped['/src/main.jsx'] = `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`
    }
    if (!mapped['/public/index.html']) {
      mapped['/public/index.html'] = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CipherStudio Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
    }
    if (!mapped['/src/index.css']) {
      mapped['/src/index.css'] = `:root{color-scheme:light dark}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
#root{min-height:100vh}`
    }
    return mapped
  }, [files])

  const onRefresh = () => setRefreshToken((t) => t + 1)

  return (
    <div className="h-full flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FiEye size={14} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Preview</span>
        </div>
        <button
          onClick={onRefresh}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Restart Sandpack"
        >
          <FiRefreshCw size={14} />
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <SandpackProvider
          key={refreshToken}
          template="react"
          files={sandpackFiles}
          customSetup={{
            entry: '/src/main.jsx',
            dependencies: {
              react: '18.2.0',
              'react-dom': '18.2.0',
            },
          }}
          options={{
            recompileMode: 'delayed',
            recompileDelay: 300,
            bundlerURL: undefined, // use default stable bundler
          }}
        >
          <SandpackLayout className="h-full">
            <SandpackPreview
              className="h-full"
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
              showNavigator={false}
              style={{ height: '100%', background: isDark ? '#0b0f19' : '#ffffff' }}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  )
}

export default Preview