import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  fontSize: 14,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setFontSize: (state, action) => {
      state.fontSize = action.payload
    },
    toggleWordWrap: (state) => {
      state.wordWrap = !state.wordWrap
    },
    toggleMinimap: (state) => {
      state.minimap = !state.minimap
    },
    toggleLineNumbers: (state) => {
      state.lineNumbers = !state.lineNumbers
    },
  },
})

export const { setFontSize, toggleWordWrap, toggleMinimap, toggleLineNumbers } = editorSlice.actions
export default editorSlice.reducer