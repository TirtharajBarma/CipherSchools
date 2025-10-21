import { apiConfig } from '../config/api.js'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

class AIService {
  constructor() {
    this.apiKey = null
  }

  setApiKey(key) {
    this.apiKey = key
    localStorage.setItem('openrouter_api_key', key)
  }

  getApiKey() {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('openrouter_api_key')
    }
    return this.apiKey
  }

  hasApiKey() {
    return !!this.getApiKey()
  }

  async getCodeCompletion(code, cursor, fileName) {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    const beforeCursor = code.substring(0, cursor)
    const afterCursor = code.substring(cursor)
    
    const fileExtension = fileName.split('.').pop()
    const language = fileExtension === 'jsx' ? 'React JSX' : 
                     fileExtension === 'tsx' ? 'React TSX' : 
                     fileExtension === 'js' ? 'JavaScript' : 
                     fileExtension === 'ts' ? 'TypeScript' : 
                     fileExtension === 'css' ? 'CSS' : 'code'

    const prompt = `You are an expert ${language} developer. Complete the following code. Only return the completion, no explanations.

File: ${fileName}

Code before cursor:
\`\`\`${fileExtension}
${beforeCursor}
\`\`\`

Code after cursor:
\`\`\`${fileExtension}
${afterCursor}
\`\`\`

Provide ONLY the code completion that should be inserted at the cursor position. Be concise and relevant.`

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CipherStudio',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: localStorage.getItem('ai_model') || 'openai/gpt-oss-20b:free',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful code assistant. Provide code completions that are concise and follow best practices. Only return the code completion without explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('OpenRouter API Error:', errorData)
        
        const errorMessage = errorData.error?.message || 
                           errorData.message || 
                           errorData.error || 
                           `API request failed (${response.status})`
        
        // Handle common errors
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter key in settings (⚡ icon).')
        }
        if (response.status === 402) {
          throw new Error('Insufficient credits. Please add credits at https://openrouter.ai/credits')
        }
        if (response.status === 429) {
          // Check if it's free tier daily limit
          if (errorMessage.includes('free-models-per-day') || errorMessage.includes('rate limit')) {
            throw new Error('⚠️ Daily free model limit reached! Add $10 credits at openrouter.ai/credits to unlock 1000 requests/day (still $0 cost for free models) or wait 24 hours.')
          }
          throw new Error('Rate limit exceeded. Please wait a moment.')
        }
        
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid API response format')
      }
      
      let completion = data.choices[0].message.content.trim()
      
      // Clean up code blocks if present
      completion = completion.replace(/```[\w]*\n?/g, '').trim()
      
      return completion
    } catch (error) {
      console.error('AI completion error:', error)
      
      // Provide helpful error messages
      if (error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your OpenRouter API key in settings.')
      }
      if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      
      throw error
    }
  }

  async explainCode(code, fileName) {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    const fileExtension = fileName.split('.').pop()

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CipherStudio',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: localStorage.getItem('ai_model') || 'openai/gpt-oss-20b:free',
          messages: [
            {
              role: 'system',
              content: 'You are a friendly coding teacher. Explain code in a clear, concise way using simple language. Use emojis occasionally. Keep explanations short (2-4 sentences max). Focus on what the code does, not technical jargon.'
            },
            {
              role: 'user',
              content: `Explain this code in simple terms:\n\n\`\`\`${fileExtension}\n${code}\n\`\`\``
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API request failed (${response.status})`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid API response')
      }
      
      return data.choices[0].message.content
    } catch (error) {
      console.error('AI explain error:', error)
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Check your internet connection.')
      }
      throw error
    }
  }

  async fixCode(code, error, fileName) {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    const fileExtension = fileName.split('.').pop()

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CipherStudio',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: localStorage.getItem('ai_model') || 'openai/gpt-oss-20b:free',
          messages: [
            {
              role: 'system',
              content: 'You are a code debugger. Fix code issues and return ONLY the corrected code without any explanations or markdown formatting.'
            },
            {
              role: 'user',
              content: `Fix this code that has the following error:\n\nError: ${error}\n\nCode:\n\`\`\`${fileExtension}\n${code}\n\`\`\`\n\nReturn ONLY the fixed code.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.2
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API request failed (${response.status})`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid API response')
      }
      
      let fixedCode = data.choices[0].message.content.trim()
      fixedCode = fixedCode.replace(/```[\w]*\n?/g, '').trim()
      
      return fixedCode
    } catch (error) {
      console.error('AI fix error:', error)
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Check your internet connection.')
      }
      throw error
    }
  }

  async generateComponent(description) {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CipherStudio',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: localStorage.getItem('ai_model') || 'openai/gpt-oss-20b:free',
          messages: [
            {
              role: 'system',
              content: 'You are a React expert. Generate clean, modern React functional components using hooks. Return ONLY the code without explanations or markdown.'
            },
            {
              role: 'user',
              content: `Generate a React functional component: ${description}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API request failed (${response.status})`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid API response')
      }
      
      let component = data.choices[0].message.content.trim()
      component = component.replace(/```[\w]*\n?/g, '').trim()
      
      return component
    } catch (error) {
      console.error('AI generate error:', error)
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Check your internet connection.')
      }
      throw error
    }
  }
}

export default new AIService()
