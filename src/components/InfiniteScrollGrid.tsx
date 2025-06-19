'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useInfiniteItems } from '@/hooks/useItems'
import ItemCard from './ItemCard'
import NewItemCard from './NewItemCard'
import MasonryGrid from './MasonryGrid'
import type { ItemWithMetadata, Space, ContentType } from '@/types/database'
import type { MockItem } from '@/utils/mockData'

interface InfiniteScrollGridProps {
  spaceId?: string
  searchQuery: string
  selectedContentType: string | null
  onItemClick: (item: ItemWithMetadata) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onAddItem?: (item: Omit<MockItem, 'id' | 'created_at'>, openDetail?: boolean) => void
  spaces: Space[]
  processingItemIds?: Set<string>
}

export default function InfiniteScrollGrid({
  spaceId,
  searchQuery,
  selectedContentType,
  onItemClick,
  onArchive,
  onDelete,
  onAddItem,
  spaces,
  processingItemIds = new Set()
}: InfiniteScrollGridProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteItems(spaceId, 20)

  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Flatten all pages into a single array
  const allItems = data?.pages.flatMap(page => page.items) ?? []

  // Filter items based on search and content type (client-side filtering)
  const filteredItems = allItems.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesContentType = selectedContentType === null ||
      item.content_type === selectedContentType

    return matchesSearch && matchesContentType
  })

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px' // Start loading 100px before the element is visible
    })

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [handleObserver])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Error loading items. Please try again.
        </p>
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery || selectedContentType 
            ? 'No items match your filters.' 
            : 'No items found.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <MasonryGrid>
        {/* NewItemCard as first item in grid on desktop */}
        {onAddItem && (
          <div className="hidden md:block">
            <NewItemCard onAdd={(item) => onAddItem(item, false)} />
          </div>
        )}
        
        {filteredItems.map((item) => {
          const isProcessing = processingItemIds.has(item.id);
          if (isProcessing) {
            console.log('Item is processing:', item.id);
          }
          return (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => onItemClick(item)}
              onArchive={onArchive}
              onDelete={onDelete}
              isProcessing={isProcessing}
            />
          );
        })}
      </MasonryGrid>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-8">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        {!hasNextPage && allItems.length > 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            You've reached the end! 🎉
          </p>
        )}
      </div>
    </div>
  )
}