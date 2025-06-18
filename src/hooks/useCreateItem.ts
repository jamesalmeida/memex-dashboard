import { useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsService } from '@/lib/supabase/services'
import type { CreateItemInput } from '@/types/database'
import { itemKeys } from './useItems'

// Hook to create a new item with cache invalidation
export function useCreateItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (input: CreateItemInput) => itemsService.createItem(input),
    onSuccess: (newItem) => {
      // Add the new item to cache
      queryClient.setQueryData(itemKeys.detail(newItem.id), newItem)
      
      // Invalidate and refetch item lists to show the new item
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() })
      queryClient.invalidateQueries({ queryKey: itemKeys.infinite() })
    },
  })
}