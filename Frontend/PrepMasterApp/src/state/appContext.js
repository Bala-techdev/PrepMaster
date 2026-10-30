import { createContext, useContext } from 'react'

/* Kept separate from the provider component so the provider module only
   exports a component (fast refresh friendly). */
export const AppStateContext = createContext(null)

export function useAppState() {
  const context = useContext(AppStateContext)

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider')
  }

  return context
}
