import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FiTerminal, FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import { updateFileCode } from '../store/slices/projectSlice'

const Terminal = () => {
  const dispatch = useDispatch()
  const { isDark } = useSelector(state => state.theme)
  const { files } = useSelector(state => state.project)
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [history, setHistory] = useState([
    { type: 'system', content: 'CipherStudio Terminal v1.0.0' },
    { type: 'system', content: 'Type "help" for available commands' },
  ])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef(null)
  const terminalRef = useRef(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const addToHistory = (type, content) => {
    setHistory(prev => [...prev, { type, content, timestamp: Date.now() }])
  }

  const executeCommand = async (cmd) => {
    const trimmedCmd = cmd.trim()
    if (!trimmedCmd) return

    addToHistory('command', `$ ${trimmedCmd}`)
    setCommandHistory(prev => [...prev, trimmedCmd])
    setHistoryIndex(-1)

    const [command, ...args] = trimmedCmd.split(' ')

    switch (command.toLowerCase()) {
      case 'help':
        addToHistory('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        addToHistory('system', '📦 CipherStudio Terminal - Available Commands')
        addToHistory('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        addToHistory('output', '')
        addToHistory('success', '💻 General Commands:')
        addToHistory('output', '  help                 Show this help message')
        addToHistory('output', '  clear                Clear terminal output')
        addToHistory('output', '  echo <text>          Print text to terminal')
        addToHistory('output', '  pwd                  Print working directory')
        addToHistory('output', '  ls                   List files in directory')
        addToHistory('output', '  date                 Show current date/time')
        addToHistory('output', '  whoami               Show current user')
        addToHistory('output', '')
        addToHistory('success', '📦 NPM Commands:')
        addToHistory('output', '  npm install <pkg>    Install npm package')
        addToHistory('output', '  npm i <pkg>          Short for npm install')
        addToHistory('output', '  npm list             List installed packages')
        addToHistory('output', '  npm -v               Show npm version')
        addToHistory('output', '')
        addToHistory('success', '⚙️  Node Commands:')
        addToHistory('output', '  node -v              Show Node.js version')
        addToHistory('output', '')
        addToHistory('warning', '⚠️  Note: Build tools (tailwind, sass, etc.) require')
        addToHistory('warning', '   compilation and may not work in browser preview.')
        addToHistory('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        break

      case 'clear':
        setHistory([])
        break

      case 'npm':
        await handleNpmCommand(args)
        break

      case 'node':
        if (args[0] === '-v' || args[0] === '--version') {
          addToHistory('output', 'v18.2.0')
        } else {
          addToHistory('error', 'Node.js execution not supported in browser')
        }
        break

      case 'echo':
        addToHistory('output', args.join(' '))
        break

      case 'pwd':
        addToHistory('output', '/home/cipherstudio/project')
        break

      case 'ls':
        addToHistory('output', 'src/  public/  package.json  README.md')
        break

      case 'date':
        addToHistory('output', new Date().toString())
        break

      case 'whoami':
        addToHistory('output', 'cipherstudio-user')
        break

      default:
        addToHistory('error', `Command not found: ${command}. Type "help" for available commands.`)
    }
  }

  const handleNpmCommand = async (args) => {
    const subcommand = args[0]

    switch (subcommand) {
      case '-v':
      case '--version':
        addToHistory('output', '9.6.7')
        break

      case 'install':
      case 'i':
        if (args.length < 2) {
          addToHistory('error', 'Usage: npm install <package-name>')
          break
        }
        const packageName = args[1]
        
        // Warn about build-time packages
        const buildTimePackages = ['tailwindcss', 'postcss', 'autoprefixer', 'sass', 'scss', 'typescript', 'vite', 'webpack', 'esbuild', 'rollup']
        if (buildTimePackages.some(pkg => packageName.toLowerCase().includes(pkg))) {
          addToHistory('warning', `⚠️  Warning: ${packageName} requires build-time compilation`)
          addToHistory('warning', '   This package may not work in the browser preview')
          addToHistory('warning', `   For Tailwind: Add CDN to index.html instead`)
          addToHistory('warning', `   <script src="https://cdn.tailwindcss.com"></script>`)
        }
        
        addToHistory('output', `Installing ${packageName}...`)
        
        // Simulate npm install
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        try {
          // Fetch package info from npm registry
          const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`)
          if (!response.ok) throw new Error('Package not found')
          
          const data = await response.json()
          
          addToHistory('success', `✓ ${packageName}@${data.version}`)
          addToHistory('output', `added 1 package in 2s`)
          
          // Update package.json file
          const currentPackageJson = files['/package.json']
          if (currentPackageJson) {
            try {
              const pkgJson = JSON.parse(currentPackageJson.code)
              if (!pkgJson.dependencies) {
                pkgJson.dependencies = {}
              }
              pkgJson.dependencies[packageName] = data.version
              
              // Update package.json in Redux
              dispatch(updateFileCode({
                fileName: '/package.json',
                code: JSON.stringify(pkgJson, null, 2)
              }))
              
              addToHistory('success', `✓ Updated package.json`)
            } catch (err) {
              console.error('Failed to update package.json:', err)
            }
          }
          
          // Add to Sandpack dependencies
          const event = new CustomEvent('npm-install', { 
            detail: { name: packageName, version: data.version } 
          })
          window.dispatchEvent(event)
        } catch (error) {
          addToHistory('error', `npm ERR! 404 Not Found - ${packageName}`)
        }
        break

      case 'list':
      case 'ls':
        // Read from package.json to show installed packages
        const pkgJsonFile = files['/package.json']
        if (pkgJsonFile) {
          try {
            const pkgJson = JSON.parse(pkgJsonFile.code)
            const deps = pkgJson.dependencies || {}
            
            addToHistory('output', `${pkgJson.name || 'cipherstudio-app'}@${pkgJson.version || '0.1.0'}`)
            
            const depEntries = Object.entries(deps)
            if (depEntries.length === 0) {
              addToHistory('output', '└── (no packages installed yet)')
            } else {
              depEntries.forEach(([name, version], index) => {
                const isLast = index === depEntries.length - 1
                const prefix = isLast ? '└──' : '├──'
                addToHistory('output', `${prefix} ${name}@${version}`)
              })
            }
          } catch (err) {
            addToHistory('error', 'Failed to parse package.json')
          }
        } else {
          addToHistory('output', `cipherstudio-app@0.1.0`)
          addToHistory('output', '└── (no package.json found)')
        }
        break

      case 'start':
        addToHistory('output', 'Starting development server...')
        addToHistory('success', '✓ Preview is running at right panel')
        break

      case 'build':
        addToHistory('output', 'Building for production...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        addToHistory('success', '✓ Build completed successfully')
        break

      default:
        addToHistory('error', `Unknown npm command: ${subcommand}`)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setInput('')
        } else {
          setHistoryIndex(newIndex)
          setInput(commandHistory[newIndex])
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Basic autocomplete
      const commands = ['help', 'clear', 'npm', 'node', 'echo', 'pwd', 'ls', 'date']
      const match = commands.find(cmd => cmd.startsWith(input.toLowerCase()))
      if (match) setInput(match)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-12 h-12 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg shadow-lg transition-all flex items-center justify-center z-40"
        title="Open Terminal"
      >
        <FiTerminal size={20} />
      </button>
    )
  }

  return (
    <div
      className={`fixed bg-gray-900 dark:bg-black text-green-400 font-mono text-sm rounded-lg shadow-2xl z-40 flex flex-col ${
        isMaximized
          ? 'inset-4'
          : 'bottom-6 left-6 w-[600px] h-[400px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <FiTerminal size={16} />
          <span className="font-semibold">Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="hover:bg-gray-700 p-1 rounded transition-colors"
          >
            {isMaximized ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-gray-700 p-1 rounded transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item, index) => (
          <div key={index} className={`
            ${item.type === 'command' ? 'text-white' : ''}
            ${item.type === 'output' ? 'text-gray-300' : ''}
            ${item.type === 'error' ? 'text-red-400' : ''}
            ${item.type === 'success' ? 'text-green-400' : ''}
            ${item.type === 'system' ? 'text-blue-400' : ''}
            ${item.type === 'warning' ? 'text-yellow-400' : ''}
          `}>
            {item.content}
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center space-x-2">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}

export default Terminal
