import { useSelector } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { FiRefreshCw, FiAlertCircle, FiEye } from 'react-icons/fi'

const Preview = () => {
  const { files } = useSelector(state => state.project)
  const { isDark } = useSelector(state => state.theme)
  const iframeRef = useRef(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const generatePreviewHTML = () => {
    const appCode = files['/App.js']?.code || ''

    // Extract the JSX content from the React component
    let htmlContent = ''
    try {
      // Look for the return statement content
      const returnMatch = appCode.match(/return\s*\(([\s\S]*?)\);?\s*}?\s*$/m)
      if (returnMatch) {
        htmlContent = returnMatch[1].trim()
      } else {
        // Fallback for simple return
        const simpleMatch = appCode.match(/return\s+([\s\S]*?);?\s*}?\s*$/m)
        if (simpleMatch) {
          htmlContent = simpleMatch[1].trim()
        }
      }

      // Convert JSX-like syntax to HTML
      htmlContent = htmlContent
        .replace(/<div\s+style=\{\{([^}]+)\}\}/g, (match, styles) => {
          const cssStyles = styles
            .replace(/(\w+):\s*'([^']+)'/g, '$1: $2')
            .replace(/(\w+):\s*"([^"]+)"/g, '$1: $2')
            .replace(/,\s*/g, '; ')
            .replace(/([A-Z])/g, (match, letter) => '-' + letter.toLowerCase())
          return `<div style="${cssStyles}"`
        })
        .replace(/onClick=\{[^}]+\}/g, 'onclick="alert(\'Button clicked!\')"')
        .replace(/className="([^"]+)"/g, 'class="$1"')
        .replace(/\{[^}]*\}/g, '') // Remove JSX expressions
        .replace(/<(\w+)([^>]*?)\/>/g, '<$1$2></$1>') // Convert self-closing tags

    } catch (e) {
      htmlContent = '<div style="color: red;">Error parsing component</div>'
    }

    // Fallback content if parsing fails
    if (!htmlContent || htmlContent.length < 10) {
      htmlContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Hello CipherStudio!</h1>
          <p>Start building your React app here.</p>
          <button onclick="alert('Button clicked!')" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Click me!
          </button>
        </div>
      `
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Preview</title>
    <style>
        body { 
            margin: 0; 
            font-family: Arial, sans-serif; 
            background: white;
        }
        button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background-color: #0056b3;
        }
        h1 {
            color: #333;
            margin-bottom: 16px;
        }
        p {
            margin-bottom: 16px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    ${htmlContent}
    <script>
        console.log('Preview loaded successfully');
    </script>
</body>
</html>`
  }

  const refreshPreview = () => {
    setIsLoading(true)
    setError(null)

    try {
      const html = generatePreviewHTML()
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)

      if (iframeRef.current) {
        iframeRef.current.src = url

        // Clean up the previous URL
        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshPreview()
    }, 300) // Debounce updates

    return () => clearTimeout(timer)
  }, [files])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setError('Failed to load preview')
    setIsLoading(false)
  }

  return (
    <div className="h-full flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FiEye size={14} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Preview</span>
        </div>
        <button
          onClick={refreshPreview}
          disabled={isLoading}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          title="Refresh Preview"
        >
          <FiRefreshCw className={isLoading ? 'animate-spin' : ''} size={14} />
        </button>
      </div>

      <div className="flex-1 min-h-0 relative">
        {error ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <FiAlertCircle className="mx-auto mb-2 text-red-500" size={24} />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={refreshPreview}
                className="mt-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Updating preview...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none bg-white"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin"
              title="Code Preview"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Preview