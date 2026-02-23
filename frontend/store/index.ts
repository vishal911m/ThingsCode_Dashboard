import { configureStore } from '@reduxjs/toolkit'
import machinesReducer from './machinesSlice'
import jobsReducer from './jobsSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    machines: machinesReducer,
    jobs: jobsReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
