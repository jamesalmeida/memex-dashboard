import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsService } from '@/lib/supabase/services'
import type { ItemWithMetadata, UpdateItemInput } from '@/types/database'

// Query keys for consistent caching
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (spaceId?: string) => [...itemKeys.lists(), spaceId] as const,
  infinite: () => [...itemKeys.all, 'infinite'] as const,
  infiniteList: (spaceId?: string) => [...itemKeys.infinite(), spaceId] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
}

// Hook to get all items with caching (keep for backward compatibility)
export function useItems(spaceId?: string) {
  return useQuery({
    queryKey: itemKeys.list(spaceId),
    queryFn: () => itemsService.getItems(spaceId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for infinite scroll items
export function useInfiniteItems(spaceId?: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: itemKeys.infiniteList(spaceId),
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * limit
      const items = await itemsService.getItems(spaceId, limit, offset)
      
      return {
        items,
        nextPage: items.length === limit ? pageParam + 1 : undefined,
        hasMore: items.length === limit
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to get a single item with caching
export function useItem(id: string) {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: () => itemsService.getItem(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id, // Only run if id exists
  })
}

// Hook to update an item with cache invalidation
export function useUpdateItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateItemInput }) =>
      itemsService.updateItem(id, updates),
    onSuccess: (updatedItem, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(itemKeys.detail(id), updatedItem)
      
      // Invalidate and refetch item lists to show updates
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() })
      queryClient.invalidateQueries({ queryKey: itemKeys.infinite() })
    },
  })
}

// Hook to delete an item with cache invalidation
export function useDeleteItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => itemsService.deleteItem(id),
    onSuccess: (_, id) => {
      // Remove item from cache
      queryClient.removeQueries({ queryKey: itemKeys.detail(id) })
      
      // Invalidate lists to remove deleted item
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() })
      queryClient.invalidateQueries({ queryKey: itemKeys.infinite() })
    },
  })
}

// Hook to archive an item with cache invalidation
export function useArchiveItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => itemsService.archiveItem(id),
    onSuccess: () => {
      // Invalidate all item lists to remove archived item
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() })
      queryClient.invalidateQueries({ queryKey: itemKeys.infinite() })
    },
  })
}

// Hook to toggle favorite status with cache invalidation
export function useToggleFavorite() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      itemsService.toggleFavorite(id, isFavorite),
    onSuccess: (_, { id }) => {
      // Invalidate the specific item and lists
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() })
      queryClient.invalidateQueries({ queryKey: itemKeys.infinite() })
    },
  })
}