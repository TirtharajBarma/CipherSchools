import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { FiX, FiKey, FiCpu, FiCheck, FiAlertCircle } from 'react-icons/fi'
import aiService from '../services/aiService'

const AISettings = ({ onClose }) => {
  const [apiKey, setApiKey] = useState(aiService.getApiKey() || '')
  const [model, setModel] = useState(localStorage.getItem('ai_model') || 'openai/gpt-oss-20b:free')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState('')

  const models = [
    { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek V3.1 (Free)', description: 'Large hybrid reasoning model - 671B params', free: true },
    { id: 'openai/gpt-oss-20b:free', name: 'GPT-OSS-20B (Free)', description: 'Open-weight 21B parameter MoE model', free: true },
    { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder 480B A35B (Free)', description: 'Optimized for coding tasks - 480B params', free: true },
    { id: 'google/gemma-3n-e2b-it:free', name: 'Gemma 3n 2B (Free)', description: 'Lightweight efficient model - 2B params', free: true },
    { id: 'meta-llama/llama-3.3-8b-instruct:free', name: 'Llama 3.3 8B (Free)', description: 'Ultra-fast open source model', free: true },
  ]

    const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key is required')
      return
    }

    aiService.setApiKey(apiKey)
    localStorage.setItem('ai_model', model)
    setSaved(true)
    setError('')
    setTestResult('')
    
    setTimeout(() => setSaved(false), 3000)
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setError('Please enter API key first')
      return
    }

    setTesting(true)
    setError('')
    setTestResult('')

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CipherStudio',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Say hello' }],
          max_tokens: 10
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Test Error:', data)
        throw new Error(data.error?.message || data.message || `Status ${response.status}`)
      }

      setTestResult('✅ API key works! Model responded successfully.')
    } catch (err) {
      console.error('API Test Failed:', err)
      setError(`Test failed: ${err.message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <FiCpu className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure OpenRouter API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Get your OpenRouter API key:</p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Visit <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">openrouter.ai/keys</a></li>
                  <li>Sign in or create an account</li>
                  <li>Create a new API key</li>
                  <li>Paste it below</li>
                </ol>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiKey className="inline mr-2" />
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Your API key is stored locally and never sent to our servers
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiCpu className="inline mr-2" />
              AI Model
            </label>
            <div className="space-y-2">
              {models.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    model === m.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={m.id}
                    checked={model === m.id}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{m.name}</span>
                      {m.id.includes('free') && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          FREE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{m.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Features List */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">AI Features:</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                Code completion and suggestions
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                Explain code in plain English
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                Auto-fix errors and bugs
              </li>
              <li className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                Generate components from description
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">{testResult}</p>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <FiCheck className="mr-2" />
                Settings saved successfully!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleTest}
            disabled={!apiKey.trim() || testing}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {testing ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Testing...</span>
              </>
            ) : (
              <span>🧪 Test API Key</span>
            )}
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISettings
