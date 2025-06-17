import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsService } from '@/lib/supabase/services'
import { itemKeys } from './useItems'
import type { Tag, CreateTagInput } from '@/types/database'

// Query keys for consistent caching
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
}

// Hook to get all tags with caching
export function useTags() {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: () => tagsService.getTags(),
    staleTime: 1000 * 60 * 10, // 10 minutes (tags change less frequently)
  })
}

// Hook to get a single tag
export function useTag(id: string) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => tagsService.getTag(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!id,
  })
}

// Hook to create a tag with cache invalidation
export function useCreateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (input: CreateTagInput) => tagsService.createTag(input),
    onSuccess: () => {
      // Invalidate tag lists to show new tag
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
  })
}

// Hook to delete a tag with cache invalidation
export function useDeleteTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => tagsService.deleteTag(id),
    onSuccess: (_, id) => {
      // Remove tag from cache
      queryClient.removeQueries({ queryKey: tagKeys.detail(id) })
      
      // Invalidate tag lists
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
      
      // Also invalidate item lists since items might have this tag
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() })
    },
  })
}

// Hook to add a tag to an item
export function useAddTagToItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ itemId, tagName }: { itemId: string; tagName: string }) => 
      tagsService.addTagToItem(itemId, tagName),
    onSuccess: (_, { itemId }) => {
      // Invalidate the specific item and item lists
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(itemId) })
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() })
      
      // Also invalidate tags list in case a new tag was created
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() })
    },
  })
}

// Hook to remove a tag from an item
export function useRemoveTagFromItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ itemId, tagId }: { itemId: string; tagId: string }) =>
      tagsService.removeTagFromItem(itemId, tagId),
    onSuccess: (_, { itemId }) => {
      // Invalidate the specific item and item lists
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(itemId) })
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() })
    },
  })
}