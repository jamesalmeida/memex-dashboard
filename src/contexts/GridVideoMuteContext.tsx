'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface GridVideoMuteContextType {
  isHoverUnmuteEnabled: boolean
  setIsHoverUnmuteEnabled: (enabled: boolean) => void
}

const GridVideoMuteContext = createContext<GridVideoMuteContextType | undefined>(undefined)

const STORAGE_KEY = 'grid-hover-unmute-enabled'

export function GridVideoMuteProvider({ children }: { children: React.ReactNode }) {
  const [isHoverUnmuteEnabled, setIsHoverUnmuteEnabledState] = useState(true)

  // Load persisted state on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsHoverUnmuteEnabledState(stored === 'true')
    }
  }, [])

  // Persist state changes
  const setIsHoverUnmuteEnabled = (enabled: boolean) => {
    console.log('[GridVideoMuteContext] Setting hover unmute enabled to:', enabled)
    setIsHoverUnmuteEnabledState(enabled)
    localStorage.setItem(STORAGE_KEY, String(enabled))
  }

  return (
    <GridVideoMuteContext.Provider value={{ isHoverUnmuteEnabled, setIsHoverUnmuteEnabled }}>
      {children}
    </GridVideoMuteContext.Provider>
  )
}

export function useGridVideoMute() {
  const context = useContext(GridVideoMuteContext)
  if (context === undefined) {
    throw new Error('useGridVideoMute must be used within a GridVideoMuteProvider')
  }
  return context
}