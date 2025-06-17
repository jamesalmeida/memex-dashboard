import { useQuery } from '@tanstack/react-query'
import { itemsService } from '@/lib/supabase/services'

// Query keys for search
export const searchKeys = {
  all: ['search'] as const,
  results: (query: string) => [...searchKeys.all, 'results', query] as const,
}

// Hook to search items with caching
export function useSearchItems(query: string) {
  return useQuery({
    queryKey: searchKeys.results(query),
    queryFn: () => itemsService.searchItems(query),
    staleTime: 1000 * 60 * 2, // Search results stay fresh for 2 minutes
    enabled: query.length >= 2, // Only search when query is at least 2 characters
  })
}