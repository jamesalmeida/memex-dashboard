import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Keep unused data in cache for 10 minutes  
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for data freshness
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect unless stale
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})