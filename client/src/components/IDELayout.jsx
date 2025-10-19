import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { updateFileCode } from '../store/slices/projectSlice'
import CodeEditor from './CodeEditor'
import Preview from './Preview'

const IDELayout = () => {
  return (
    <div className="flex-1 ide-layout overflow-hidden">
      {/* Code Editor */}
      <div className="flex-1 flex flex-col min-h-0 mobile-editor">
        <CodeEditor />
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col min-h-0 mobile-preview">
        <Preview />
      </div>
    </div>
  )
}

export default IDELayout