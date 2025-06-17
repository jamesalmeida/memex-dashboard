import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spacesService } from '@/lib/supabase/services'
import type { Space, CreateSpaceInput, UpdateSpaceInput } from '@/types/database'

// Query keys for consistent caching
export const spaceKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceKeys.all, 'list'] as const,
  withCounts: () => [...spaceKeys.all, 'withCounts'] as const,
  details: () => [...spaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...spaceKeys.details(), id] as const,
}

// Hook to get all spaces with caching
export function useSpaces() {
  return useQuery({
    queryKey: spaceKeys.lists(),
    queryFn: () => spacesService.getSpaces(),
    staleTime: 1000 * 60 * 10, // 10 minutes (spaces change less frequently)
  })
}

// Hook to get spaces with item counts
export function useSpacesWithCounts() {
  return useQuery({
    queryKey: spaceKeys.withCounts(),
    queryFn: () => spacesService.getSpacesWithCounts(),
    staleTime: 1000 * 60 * 5, // 5 minutes (counts change more frequently)
  })
}

// Hook to get a single space
export function useSpace(id: string) {
  return useQuery({
    queryKey: spaceKeys.detail(id),
    queryFn: () => spacesService.getSpace(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!id,
  })
}

// Hook to create a space with cache invalidation
export function useCreateSpace() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (input: CreateSpaceInput) => spacesService.createSpace(input),
    onSuccess: () => {
      // Invalidate all space queries to show new space
      queryClient.invalidateQueries({ queryKey: spaceKeys.all })
    },
  })
}

// Hook to update a space with cache invalidation
export function useUpdateSpace() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateSpaceInput }) =>
      spacesService.updateSpace(id, updates),
    onSuccess: (updatedSpace, { id }) => {
      // Update the specific space in cache
      queryClient.setQueryData(spaceKeys.detail(id), updatedSpace)
      
      // Invalidate space lists to show updates
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: spaceKeys.withCounts() })
    },
  })
}

// Hook to delete a space with cache invalidation
export function useDeleteSpace() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => spacesService.deleteSpace(id),
    onSuccess: (_, id) => {
      // Remove space from cache
      queryClient.removeQueries({ queryKey: spaceKeys.detail(id) })
      
      // Invalidate lists to remove deleted space
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: spaceKeys.withCounts() })
    },
  })
}