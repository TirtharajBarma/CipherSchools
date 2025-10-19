import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './slices/themeSlice'
import projectReducer from './slices/projectSlice'
import editorReducer from './slices/editorSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    project: projectReducer,
    editor: editorReducer,
    auth: authReducer,
  },
})