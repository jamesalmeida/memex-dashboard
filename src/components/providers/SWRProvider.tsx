'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
  fallback?: Record<string, any>
}

export function SWRProvider({ children, fallback = {} }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fallback,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000, // 1 minute
        focusThrottleInterval: 60000, // 1 minute
        fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
      }}
    >
      {children}
    </SWRConfig>
  )
}