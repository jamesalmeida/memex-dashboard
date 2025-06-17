import { useInfiniteQuery } from '@tanstack/react-query'
import { itemsService } from '@/lib/supabase/services'
import { itemKeys } from './useItems'

interface PaginatedItemsParams {
  spaceId?: string
  limit?: number
}

// Hook for infinite scroll/pagination with caching
export function usePaginatedItems({ spaceId, limit = 20 }: PaginatedItemsParams = {}) {
  return useInfiniteQuery({
    queryKey: [...itemKeys.list(spaceId), 'paginated', limit],
    queryFn: async ({ pageParam = 0 }) => {
      // For now, we'll simulate pagination by slicing the full dataset
      // In a real app, you'd modify itemsService.getItems to accept offset/limit
      const allItems = await itemsService.getItems(spaceId)
      
      const start = pageParam * limit
      const end = start + limit
      const paginatedItems = allItems.slice(start, end)
      
      return {
        items: paginatedItems,
        nextPage: end < allItems.length ? pageParam + 1 : undefined,
        totalCount: allItems.length
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Utility hook to check if we should show "Load More" button
export function useHasMoreItems(query: ReturnType<typeof usePaginatedItems>) {
  return {
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    totalItems: query.data?.pages[0]?.totalCount ?? 0,
    loadedItems: query.data?.pages.reduce((acc, page) => acc + page.items.length, 0) ?? 0
  }
}