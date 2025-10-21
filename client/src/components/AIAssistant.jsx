import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FiZap, FiMessageSquare, FiTool, FiCode, FiX, FiLoader } from 'react-icons/fi'
import { updateFileCode } from '../store/slices/projectSlice'
import aiService from '../services/aiService'

const AIAssistant = () => {
  const dispatch = useDispatch()
  const { files, activeFile } = useSelector(state => state.project)
  const { isDark } = useSelector(state => state.theme)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('suggest') // suggest, explain, fix, generate
  const [selectedText, setSelectedText] = useState('')
  const [hasKey, setHasKey] = useState(aiService.hasApiKey())

  // Listen for text selection from Monaco Editor
  useEffect(() => {
    const handleSelection = (event) => {
      if (event.detail?.selectedText) {
        setSelectedText(event.detail.selectedText)
      }
    }

    window.addEventListener('monaco-selection', handleSelection)
    return () => window.removeEventListener('monaco-selection', handleSelection)
  }, [])

  // React to API key changes (storage or explicit settings save event)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'openrouter_api_key') {
        setHasKey(!!e.newValue)
      }
    }
    const onUpdated = () => setHasKey(aiService.hasApiKey())
    window.addEventListener('storage', onStorage)
    window.addEventListener('ai-settings-updated', onUpdated)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ai-settings-updated', onUpdated)
    }
  }, [])

  const modes = [
    { id: 'suggest', icon: FiZap, label: 'Complete', desc: 'Get code suggestions' },
    { id: 'explain', icon: FiMessageSquare, label: 'Explain', desc: 'Understand code' },
    { id: 'fix', icon: FiTool, label: 'Fix', desc: 'Auto-fix errors' },
    { id: 'generate', icon: FiCode, label: 'Generate', desc: 'Create component' },
  ]

  const handleModeChange = (newMode) => {
    setMode(newMode)
    // Clear result when switching modes
    setResult('')
    setError('')
  }

  const handleSuggest = async () => {
    if (!activeFile || !files[activeFile]) return
    
    setLoading(true)
    setError('')
    setResult('')
    
    try {
      // Use selected text if available, otherwise use full file
      const code = selectedText || files[activeFile].code
      const cursorPos = code.length
      const suggestion = await aiService.getCodeCompletion(code, cursorPos, activeFile)
      setResult(suggestion)
    } catch (err) {
      console.error('AI Suggest Error:', err)
      setError(err.message || 'Failed to get suggestion. Check your API key and internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleExplain = async () => {
    if (!activeFile || !files[activeFile]) return
    
    setLoading(true)
    setError('')
    setResult('')
    
    try {
      // Use selected text if available, otherwise use full file
      const code = selectedText || files[activeFile].code
      if (!code.trim()) {
        setError('No code to explain. Select some code first.')
        setLoading(false)
        return
      }
      const explanation = await aiService.explainCode(code, activeFile)
      setResult(explanation)
    } catch (err) {
      console.error('AI Explain Error:', err)
      setError(err.message || 'Failed to explain code. Check your API key and internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleFix = async () => {
    if (!activeFile || !files[activeFile]) return
    
    const errorMsg = prompt('Describe the error or issue (or leave empty to auto-fix selected code):')
    if (errorMsg === null) return // User cancelled
    
    setLoading(true)
    setError('')
    setResult('')
    
    try {
      // Use selected text if available, otherwise use full file
      const code = selectedText || files[activeFile].code
      if (!code.trim()) {
        setError('No code to fix. Select some code first.')
        setLoading(false)
        return
      }
      const errorDescription = errorMsg || 'Fix any syntax errors, bugs, or issues in this code'
      const fixedCode = await aiService.fixCode(code, errorDescription, activeFile)
      setResult(fixedCode)
    } catch (err) {
      console.error('AI Fix Error:', err)
      setError(err.message || 'Failed to fix code. Check your API key and internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    const description = prompt('Describe the component you want to generate:')
    if (!description) return
    
    setLoading(true)
    setError('')
    setResult('')
    
    try {
      const component = await aiService.generateComponent(description)
      setResult(component)
    } catch (err) {
      console.error('AI Generate Error:', err)
      setError(err.message || 'Failed to generate component. Check your API key and internet connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (!result) return
    
    if (mode === 'suggest' && activeFile) {
      // Append suggestion to current file
      const currentCode = files[activeFile].code
      dispatch(updateFileCode({ 
        fileName: activeFile, 
        code: currentCode + '\n' + result 
      }))
    } else if (mode === 'fix' && activeFile) {
      // Replace with fixed code
      dispatch(updateFileCode({ 
        fileName: activeFile, 
        code: result 
      }))
    } else if (mode === 'generate') {
      // Create new file or append
      if (activeFile) {
        dispatch(updateFileCode({ 
          fileName: activeFile, 
          code: result 
        }))
      }
    }
    
    // Clear result and reset state
    setResult('')
    setError('')
    setSelectedText('')
  }

  const handleClear = () => {
    setResult('')
    setError('')
    setLoading(false)
  }

  const handleAction = () => {
    switch (mode) {
      case 'suggest': return handleSuggest()
      case 'explain': return handleExplain()
      case 'fix': return handleFix()
      case 'generate': return handleGenerate()
    }
  }

  if (!hasKey) {
    return null
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 hover:bg-black text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center z-40"
        title="AI Assistant"
      >
        <FiZap size={24} />
      </button>

      {/* AI Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiZap size={20} />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded p-1"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-900">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  mode === m.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                }`}
              >
                <m.icon className={`mx-auto mb-1 ${mode === m.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`} size={20} />
                <div className="text-xs font-medium text-gray-900 dark:text-white">{m.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center py-8">
                <FiLoader className="animate-spin text-purple-600 dark:text-purple-400 mb-2" size={32} />
                <p className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Error:</p>
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 break-words">{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Result:</p>
                  <button
                    onClick={handleClear}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
                  >
                    Clear & Try Again
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                  {mode === 'explain' ? (
                    // Render explanation as formatted text (not code)
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {result}
                      </p>
                    </div>
                  ) : (
                    // Render code with monospace font
                    <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono overflow-x-auto">
                      {result}
                    </pre>
                  )}
                </div>
                <div className="flex space-x-2">
                  {mode !== 'explain' && (
                    <button
                      onClick={handleApply}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                      Apply to Code
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result)
                      alert('Copied to clipboard!')
                    }}
                    className={`${mode === 'explain' ? 'flex-1' : ''} px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm`}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="text-center py-4">
                {selectedText && (
                  <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      ✓ Text selected ({selectedText.length} chars)
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {mode === 'suggest' && (selectedText ? 'Complete the selected code' : 'Get AI-powered code suggestions')}
                  {mode === 'explain' && (selectedText ? 'Explain the selected code' : 'Understand your code better')}
                  {mode === 'fix' && (selectedText ? 'Fix the selected code' : 'Fix errors automatically')}
                  {mode === 'generate' && 'Generate React components'}
                </p>
                <button
                  onClick={handleAction}
                  disabled={!activeFile && mode !== 'generate'}
                  className="btn w-full disabled:cursor-not-allowed"
                >
                  {mode === 'suggest' && 'Get Suggestion'}
                  {mode === 'explain' && 'Explain Code'}
                  {mode === 'fix' && 'Fix Code'}
                  {mode === 'generate' && 'Generate Component'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
