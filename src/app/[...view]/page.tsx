'use client'

import { useState, useEffect, useCallback, use } from 'react';
import { supabase } from '@/utils/supabaseClient';
import ItemCard from '@/components/ItemCard';
import CaptureModal from '@/components/CaptureModal';
import ItemDetailModal from '@/components/ItemDetailModal';
import NewItemCard from '@/components/NewItemCard';
import SpaceCard from '@/components/SpaceCard';
import NewSpaceModal from '@/components/NewSpaceModal';
import EditSpaceModal from '@/components/EditSpaceModal';
import MasonryGrid from '@/components/MasonryGrid';
import InfiniteScrollGrid from '@/components/InfiniteScrollGrid';
import LeftRail from '@/components/LeftRail';
import SettingsModal from '@/components/SettingsModal';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { itemsService, spacesService, tagsService } from '@/lib/supabase/services';
import type { ItemWithMetadata, Space, ContentType } from '@/types/database';
import type { MockItem } from '@/utils/mockData';
import { useItems, useInfiniteItems, useUpdateItem, useArchiveItem, useDeleteItem, itemKeys } from '@/hooks/useItems';
import { useSpaces, useSpacesWithCounts, spaceKeys } from '@/hooks/useSpaces';
import { useAddTagToItem, useRemoveTagFromItem } from '@/hooks/useTags';
import { useQueryClient } from '@tanstack/react-query';

interface DashboardProps {
  params: Promise<{
    view: string[];
  }>;
}

export default function Dashboard({ params }: DashboardProps) {
  // Unwrap the async params
  const resolvedParams = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'everything' | 'spaces' | 'space-detail'>('everything');
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [spaceOrderBy, setSpaceOrderBy] = useState<'alphabetical' | 'created' | 'updated' | 'items' | 'custom'>('alphabetical');
  const [alphabeticalDirection, setAlphabeticalDirection] = useState<'asc' | 'desc'>('asc');
  const [createdDirection, setCreatedDirection] = useState<'asc' | 'desc'>('desc'); // newest first by default
  const [updatedDirection, setUpdatedDirection] = useState<'asc' | 'desc'>('desc'); // most recent first by default
  const [itemsDirection, setItemsDirection] = useState<'asc' | 'desc'>('desc'); // most items first by default
  
  // Load space ordering preference from localStorage on mount
  useEffect(() => {
    const savedSpaceOrder = localStorage.getItem('memex-space-order') as typeof spaceOrderBy | null;
    if (savedSpaceOrder && ['alphabetical', 'created', 'updated', 'items', 'custom'].includes(savedSpaceOrder)) {
      setSpaceOrderBy(savedSpaceOrder);
    }
    
    const savedAlphabeticalDirection = localStorage.getItem('memex-alphabetical-direction') as typeof alphabeticalDirection | null;
    if (savedAlphabeticalDirection && ['asc', 'desc'].includes(savedAlphabeticalDirection)) {
      setAlphabeticalDirection(savedAlphabeticalDirection);
    }
    
    const savedCreatedDirection = localStorage.getItem('memex-created-direction') as typeof createdDirection | null;
    if (savedCreatedDirection && ['asc', 'desc'].includes(savedCreatedDirection)) {
      setCreatedDirection(savedCreatedDirection);
    }
    
    const savedUpdatedDirection = localStorage.getItem('memex-updated-direction') as typeof updatedDirection | null;
    if (savedUpdatedDirection && ['asc', 'desc'].includes(savedUpdatedDirection)) {
      setUpdatedDirection(savedUpdatedDirection);
    }
    
    const savedItemsDirection = localStorage.getItem('memex-items-direction') as typeof itemsDirection | null;
    if (savedItemsDirection && ['asc', 'desc'].includes(savedItemsDirection)) {
      setItemsDirection(savedItemsDirection);
    }
  }, []);

  // Save space ordering preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('memex-space-order', spaceOrderBy);
  }, [spaceOrderBy]);

  // Save direction preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('memex-alphabetical-direction', alphabeticalDirection);
  }, [alphabeticalDirection]);
  
  useEffect(() => {
    localStorage.setItem('memex-created-direction', createdDirection);
  }, [createdDirection]);
  
  useEffect(() => {
    localStorage.setItem('memex-updated-direction', updatedDirection);
  }, [updatedDirection]);
  
  useEffect(() => {
    localStorage.setItem('memex-items-direction', itemsDirection);
  }, [itemsDirection]);
  
  // Helper function to create readable space URLs
  const createSpaceUrl = (space: Space) => {
    const spaceName = space.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `/spaces/${spaceName}-${space.id}`;
  };
  
  // Helper function to extract space ID from URL segment
  const extractSpaceId = (urlSegment: string) => {
    if (urlSegment.includes('-')) {
      const parts = urlSegment.split('-');
      
      // Look for UUID pattern: 8-4-4-4-12 characters
      for (let i = 0; i < parts.length; i++) {
        const segment = parts.slice(i).join('-');
        // UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          return segment;
        }
      }
    }
    
    // Fallback: assume the whole segment is the ID
    return urlSegment;
  };
  
  // Determine view mode and selected space from URL
  const urlView = resolvedParams.view?.[0] || 'everything';
  const urlSpaceId = resolvedParams.view?.[1] ? extractSpaceId(resolvedParams.view[1]) : null;
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemWithMetadata | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);
  const [showEditSpaceModal, setShowEditSpaceModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();

  // Cached data from React Query hooks
  const spaceIdForItems = viewMode === 'space-detail' ? selectedSpace : undefined;
  const { data: items = [], isLoading: itemsLoading, error: itemsError } = useItems(spaceIdForItems);
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const { data: spacesWithCounts = [], isLoading: spacesWithCountsLoading } = useSpacesWithCounts();
  
  // Mutations for optimistic updates
  const updateItemMutation = useUpdateItem();
  const archiveItemMutation = useArchiveItem();
  const deleteItemMutation = useDeleteItem();
  const addTagMutation = useAddTagToItem();
  const removeTagMutation = useRemoveTagFromItem();
  const queryClient = useQueryClient();
  
  // Combined loading state from all queries
  const loading = itemsLoading || spacesLoading || spacesWithCountsLoading;
  
  // Handle any query errors
  if (itemsError) {
    console.error('Error loading items:', itemsError);
  }
  
  // Transition state for fade effect
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Flag to prevent recursive hash handling
  const [isHandlingHash, setIsHandlingHash] = useState(false);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      if (path === '/everything') {
        setViewMode('everything');
        setSelectedSpace(null);
      } else if (path === '/spaces') {
        setViewMode('spaces');
        setSelectedSpace(null);
      } else if (path.startsWith('/spaces/')) {
        const spaceSegment = path.split('/')[2];
        const spaceId = extractSpaceId(spaceSegment);
        
        setViewMode('space-detail');
        setSelectedSpace(spaceId);
      }
    };
    
    // Set initial state based on URL
    handlePopState();
    
    // Listen for browser navigation
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Handle hash changes for item modals
  useEffect(() => {
    const handleHashChange = async () => {
      if (isHandlingHash) return; // Skip if we're manually handling hash
      
      const hash = window.location.hash.slice(1); // Remove the # symbol
      
      if (hash && !showItemDetail) {
        // Hash exists and modal isn't open - try to open the item
        try {
          // Always fetch fresh data from database to ensure we have latest tags/data
          console.log('Fetching fresh item data for hash:', hash);
          const fetchedItem = await itemsService.getItem(hash);
          if (fetchedItem) {
            console.log('Fresh item fetched with tags:', fetchedItem.tags);
            setSelectedItem(fetchedItem);
            setShowItemDetail(true);
          } else {
            // Item doesn't exist, clear the hash
            console.log('Item not found, clearing hash');
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (error) {
          console.error('Error loading item:', error);
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else if (!hash && showItemDetail && !isHandlingHash) {
        // No hash but modal is open - close modal (but don't reset other state)
        setShowItemDetail(false);
        setSelectedItem(null);
      }
    };
    
    // Handle initial hash on page load
    if (items.length > 0) {
      handleHashChange();
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [items, showItemDetail, isHandlingHash]);

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/login');
      }
    };

    checkUser();
  }, [router]);

  // Get unique content types from current items
  const getAvailableContentTypes = () => {
    // For infinite scroll views, we use all items since filtering happens client-side
    const types = [...new Set(items.map(item => item.content_type))];
    return types.sort();
  };

  // Filter items based on search and content type
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesContentType = selectedContentType === null || item.content_type === selectedContentType;
    
    if (viewMode === 'everything') {
      return matchesSearch && matchesContentType;
    } else if (viewMode === 'space-detail' && selectedSpace) {
      return matchesSearch && matchesContentType && item.space_id === selectedSpace;
    }
    
    return false; // For spaces view, we don't show items
  });

  const handleArchive = async (id: string) => {
    try {
      // Use cached mutation - automatically handles cache updates
      await archiveItemMutation.mutateAsync(id);
      
      setShowItemDetail(false);
      setSelectedItem(null);
      
      setNotification('Item archived successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error archiving item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Use cached mutation - automatically handles cache updates
      await deleteItemMutation.mutateAsync(id);
      
      setShowItemDetail(false);
      setSelectedItem(null);
      
      setNotification('Item deleted successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleMoveToSpace = async (id: string, spaceId: string) => {
    try {
      await itemsService.updateItem(id, { space_id: spaceId });
      
      // Update local selected item if it's the same one
      if (selectedItem?.id === id) {
        const updatedItem = await itemsService.getItem(id);
        if (updatedItem) {
          setSelectedItem(updatedItem);
        }
      }
      
      // Invalidate caches to reflect the move
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: itemKeys.infinite() });
      queryClient.invalidateQueries({ queryKey: spaceKeys.withCounts() });
    } catch (error) {
      console.error('Error moving item to space:', error);
    }
  };

  const handleSpaceClick = (space: Space) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Fade out current grid
    setTimeout(() => {
      setSelectedSpace(space.id);
      setViewMode('space-detail');
      setSelectedContentType(null);
      
      // Update URL without page reload
      window.history.pushState({}, '', createSpaceUrl(space));
      
      // Fade back in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150); // Fade out duration
  };

  const handleEditSpace = (space: Space & { item_count: number }) => {
    setEditingSpace(space);
    setShowEditSpaceModal(true);
  };

  const handleDeleteSpace = async (space: Space & { item_count: number }) => {
    if (space.item_count > 0) {
      const confirmed = window.confirm(`This space contains ${space.item_count} item${space.item_count > 1 ? 's' : ''}. Are you sure you want to delete it?`);
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(`Are you sure you want to delete "${space.name}"?`);
      if (!confirmed) return;
    }

    try {
      await spacesService.deleteSpace(space.id);
      
      // Invalidate and refetch spaces to remove deleted space
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: spaceKeys.withCounts() });
      
      // If we're viewing this space, go back to spaces view
      if (selectedSpace === space.id) {
        setViewMode('spaces');
        setSelectedSpace(null);
      }
      
      setNotification(`Space "${space.name}" deleted successfully!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting space:', error);
      setNotification('Error deleting space. Please try again.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleUpdateSpace = async (data: { name: string; description?: string; color: string }) => {
    if (!editingSpace) return;

    try {
      await spacesService.updateSpace(editingSpace.id, data);
      
      // Invalidate and refetch spaces to show updates
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: spaceKeys.withCounts() });
      
      setShowEditSpaceModal(false);
      setEditingSpace(null);
      
      setNotification('Space updated successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error updating space:', error);
      setNotification('Error updating space. Please try again.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleBackToEverything = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Fade out current grid
    setTimeout(() => {
      setViewMode('everything');
      setSelectedSpace(null);
      setSelectedContentType(null);
      
      // Update URL without page reload
      window.history.pushState({}, '', '/everything');
      
      // Fade back in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150); // Fade out duration
  }, [isTransitioning]);

  const handleShowSpaces = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Fade out current grid
    setTimeout(() => {
      setViewMode('spaces');
      setSelectedSpace(null);
      setSelectedContentType(null);
      
      // Update URL without page reload
      window.history.pushState({}, '', '/spaces');
      
      // Fade back in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150); // Fade out duration
  }, [isTransitioning]);

  const handleHomeClick = () => {
    if (isTransitioning) return;
    
    if (viewMode !== 'everything') {
      setIsTransitioning(true);
      
      // Fade out current grid
      setTimeout(() => {
        setViewMode('everything');
        setSelectedSpace(null);
        setSelectedContentType(null);
        setSearchQuery('');
        
        // Update URL without page reload
        window.history.pushState({}, '', '/everything');
        
        // Fade back in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 150); // Fade out duration
    } else {
      // Already on everything view, just clear search
      setSearchQuery('');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Enhanced ESC key handling
  useEffect(() => {
    const handleGlobalEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Check if any modal is open first - let modal handlers take precedence
        const hasOpenModal = showCaptureModal || showItemDetail || showSettingsModal || 
                           showNewSpaceModal || showEditSpaceModal;
        
        if (hasOpenModal) {
          return; // Let modal ESC handlers take precedence
        }

        // Check if search bar is focused
        const activeElement = document.activeElement;
        const isSearchFocused = activeElement?.id === 'global-search' || 
                               activeElement?.classList.contains('search-input');
        
        if (isSearchFocused && searchQuery) {
          // Clear search but keep focus
          setSearchQuery('');
          event.preventDefault();
          return;
        }
        
        if (isSearchFocused && !searchQuery && selectedContentType) {
          // Clear selected filter pill and lose focus
          setSelectedContentType(null);
          (activeElement as HTMLElement)?.blur();
          event.preventDefault();
          return;
        }
        
        if (isSearchFocused && !searchQuery) {
          // Just unfocus if search is empty and no filter selected
          (activeElement as HTMLElement)?.blur();
          event.preventDefault();
          return;
        }

        // If not focused on search but has selected filter, clear it
        if (!isSearchFocused && selectedContentType) {
          setSelectedContentType(null);
          event.preventDefault();
          return;
        }

        // Navigation back functionality
        if (viewMode === 'space-detail') {
          // If in a space, go back to spaces view
          handleShowSpaces();
        } else if (viewMode === 'spaces') {
          // If on spaces page, go back to everything
          handleBackToEverything();
        }
        // If on everything page and no modals/search, do nothing
      }
    };

    document.addEventListener('keydown', handleGlobalEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleGlobalEscapeKey);
    };
  }, [showCaptureModal, showItemDetail, showSettingsModal, showNewSpaceModal, 
      showEditSpaceModal, searchQuery, selectedContentType, viewMode, handleShowSpaces, handleBackToEverything]);

  const handleContextAwareAdd = () => {
    if (viewMode === 'everything') {
      setShowCaptureModal(true);
    } else if (viewMode === 'spaces') {
      setShowNewSpaceModal(true);
    } else if (viewMode === 'space-detail') {
      setShowCaptureModal(true);
    }
  };

  const handleCreateSpace = async (newSpaceData: { name: string; color: string; description?: string }) => {
    try {
      const newSpace = await spacesService.createSpace(newSpaceData);
      
      // Invalidate and refetch spaces to show the new space
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: spaceKeys.withCounts() });
      
      setNotification('Space created successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error creating space:', error);
    }
  };

  const handleAddItem = async (newItemData: Omit<MockItem, 'id' | 'created_at'>, openDetail: boolean = false) => {
    try {
      // Convert MockItem format to our database format
      const createInput = {
        title: newItemData.title,
        url: newItemData.url,
        content_type: newItemData.content_type as ContentType,
        description: newItemData.description,
        thumbnail_url: newItemData.thumbnail_url || newItemData.thumbnail,
        space_id: viewMode === 'space-detail' && selectedSpace ? selectedSpace : 
                  newItemData.space ? spaces.find(s => s.name === newItemData.space)?.id : undefined
      };

      const newItem = await itemsService.createItem(createInput);
      
      // Store metadata if provided
      if (newItemData.metadata) {
        const metadata = newItemData.metadata;
        
        const metadataInput: Record<string, unknown> = {
          domain: metadata.domain,
          author: metadata.author,
          username: metadata.username,
          extra_data: {
            profile_image: metadata.profile_image,
            video_url: metadata.video_url,
            video_type: metadata.video_type,
            tags: metadata.tags,
            likes: metadata.likes,
            replies: metadata.replies,
            retweets: metadata.retweets,
            views: metadata.views,
            duration: metadata.duration,
            tweet_date: metadata.tweet_date,
            display_name: metadata.display_name
          }
        };
        
        // Remove undefined values
        Object.keys(metadataInput).forEach(key => {
          if (metadataInput[key] === undefined) {
            delete metadataInput[key];
          }
        });
        
        // Clean extra_data
        if (metadataInput.extra_data) {
          Object.keys(metadataInput.extra_data).forEach(key => {
            if (metadataInput.extra_data[key] === undefined) {
              delete metadataInput.extra_data[key];
            }
          });
        }
        
        await itemsService.updateItemMetadata(newItem.id, metadataInput);
      }
      
      // Invalidate and refetch items to show the new item
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: itemKeys.infinite() });
      queryClient.invalidateQueries({ queryKey: spaceKeys.withCounts() });
      
      setNotification('Item added successfully!');
      setTimeout(() => setNotification(null), 3000);
      
      if (openDetail) {
        // Fetch the full item with metadata for the detail view
        const fullItem = await itemsService.getItem(newItem.id);
        if (fullItem) {
          setSelectedItem(fullItem);
          setShowItemDetail(true);
        }
      }
      
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleItemClick = async (item: ItemWithMetadata) => {
    try {
      // Always fetch fresh data to ensure we have latest tags/updates
      console.log('Item clicked, fetching fresh data for:', item.id);
      const freshItem = await itemsService.getItem(item.id);
      if (freshItem) {
        console.log('Fresh item loaded with tags:', freshItem.tags);
        setSelectedItem(freshItem);
        setShowItemDetail(true);
        
        // Add item ID to URL hash
        window.location.hash = item.id;
      } else {
        console.error('Could not fetch fresh item data');
        // Fallback to cached item if fresh fetch fails
        setSelectedItem(item);
        setShowItemDetail(true);
        window.location.hash = item.id;
      }
    } catch (error) {
      console.error('Error fetching fresh item:', error);
      // Fallback to cached item if fresh fetch fails
      setSelectedItem(item);
      setShowItemDetail(true);
      window.location.hash = item.id;
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<MockItem>) => {
    try {
      // Check if there are any actual updates to apply
      const hasUpdates = Object.keys(updates).length > 0 && 
        Object.values(updates).some(value => value !== undefined);

      if (hasUpdates) {
        // Convert updates to database format
        const updateInput: Record<string, any> = {
          title: updates.title,
          url: updates.url,
          content_type: updates.content_type as ContentType,
          description: updates.description,
          thumbnail_url: updates.thumbnail_url || updates.thumbnail,
        };

        // Only update space_id if space is explicitly provided in updates
        if ('space' in updates) {
          updateInput.space_id = updates.space ? spaces.find(s => s.name === updates.space)?.id : null;
        }

        // Remove undefined values
        Object.keys(updateInput).forEach(key => {
          if (updateInput[key] === undefined) {
            delete updateInput[key];
          }
        });

        // Optimistically update the local selectedItem immediately
        if (selectedItem?.id === id) {
          const optimisticItem = { ...selectedItem };
          
          // Update the space relationship optimistically
          if ('space' in updates) {
            const spaceId = updates.space ? spaces.find(s => s.name === updates.space)?.id : null;
            const spaceObj = spaceId ? spaces.find(s => s.id === spaceId) : null;
            optimisticItem.space_id = spaceId;
            optimisticItem.space = spaceObj || null;
          }
          
          // Update other fields optimistically
          if (updates.title) optimisticItem.title = updates.title;
          if (updates.description !== undefined) optimisticItem.description = updates.description;
          
          // Apply optimistic update immediately
          setSelectedItem(optimisticItem);
        }
        
        // Perform the actual database update
        try {
          await updateItemMutation.mutateAsync({ id, updates: updateInput });
        } catch (error) {
          // If the update fails, revert to the original item
          if (selectedItem?.id === id) {
            const freshItem = await itemsService.getItem(id);
            if (freshItem) {
              setSelectedItem(freshItem);
            }
          }
          throw error; // Re-throw to be caught by outer try-catch
        }
      }
      // Note: For refresh-only cases (empty updates), React Query will automatically 
      // refetch when needed, so no manual refresh required
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleAddTagToItem = async (itemId: string, tagName: string) => {
    try {
      console.log('=== ADD TAG START ===');
      console.log('Adding tag:', tagName, 'to item:', itemId);
      console.log('Current selectedItem tags before:', selectedItem?.tags);
      
      // Use cached mutation - automatically handles cache updates
      await addTagMutation.mutateAsync({ itemId, tagName });
      console.log('Tag mutation completed');
      
      // Update local selected item if needed
      if (selectedItem?.id === itemId) {
        console.log('Fetching updated item from database...');
        
        // Force a refetch of the item from React Query cache
        const updatedItem = await queryClient.fetchQuery({
          queryKey: itemKeys.detail(itemId),
          queryFn: () => itemsService.getItem(itemId),
        });
        
        console.log('Updated item tags from database:', updatedItem?.tags);
        
        if (updatedItem) {
          setSelectedItem(updatedItem);
          console.log('Updated selectedItem state with new tags');
        }
      }
      console.log('=== ADD TAG END ===');
    } catch (error) {
      console.error('Error adding tag to item:', error);
    }
  };

  const handleRemoveTagFromItem = async (itemId: string, tagId: string) => {
    try {
      // Use cached mutation - automatically handles cache updates
      await removeTagMutation.mutateAsync({ itemId, tagId });
      
      // Update local selected item if needed
      if (selectedItem?.id === itemId) {
        // Force a refetch of the item from React Query cache
        const updatedItem = await queryClient.fetchQuery({
          queryKey: itemKeys.detail(itemId),
          queryFn: () => itemsService.getItem(itemId),
        });
        if (updatedItem) {
          setSelectedItem(updatedItem);
        }
      }
    } catch (error) {
      console.error('Error removing tag from item:', error);
    }
  };

  // Get selected space details
  const selectedSpaceDetails = selectedSpace ? spaces.find(s => s.id === selectedSpace) : null;

  // Sort spaces based on selected ordering
  const sortedSpacesWithCounts = [...spacesWithCounts].sort((a, b) => {
    switch (spaceOrderBy) {
      case 'alphabetical':
        const alphabeticalSort = a.name.localeCompare(b.name);
        return alphabeticalDirection === 'asc' ? alphabeticalSort : -alphabeticalSort;
      case 'created':
        const createdSort = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return createdDirection === 'desc' ? createdSort : -createdSort;
      case 'updated':
        const updatedSort = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        return updatedDirection === 'desc' ? updatedSort : -updatedSort;
      case 'items':
        const itemsSort = b.item_count - a.item_count;
        return itemsDirection === 'desc' ? itemsSort : -itemsSort;
      case 'custom':
      default:
        return a.sort_order - b.sort_order;
    }
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-medium text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Left Rail */}
      <div id="left-rail">
        <LeftRail 
          onSettingsClick={() => setShowSettingsModal(true)}
          viewMode={viewMode}
          onEverythingClick={handleBackToEverything}
          onSpacesClick={handleShowSpaces}
          onHomeClick={handleHomeClick}
          onAddClick={handleContextAwareAdd}
        />
      </div>

      {/* Mobile Menu Button - Left */}
      <button
        id="floating-menu-button"
        onClick={() => setShowSettingsModal(true)}
        className="md:hidden fixed bottom-6 left-6 w-[52px] h-[52px] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-2xl drop-shadow-lg z-50"
        aria-label="Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Floating Navigation Toggle - Mobile only - Centered */}
      <div id="floating-navigation-toggle" className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-1 flex items-center h-[52px] w-[120px] shadow-2xl drop-shadow-lg z-50">
        <div 
          className="absolute h-[calc(100%-8px)] bg-[rgb(255,77,6)] rounded-full transition-all duration-200 ease-out"
          style={{
            width: 'calc(50% - 4px)',
            left: viewMode === 'everything' ? '4px' : 'calc(50%)',
          }}
        />
        
        <button
          onClick={handleBackToEverything}
          className={`relative z-10 px-3 py-3 transition-colors rounded-full flex-1 flex items-center justify-center ${
            viewMode === 'everything' 
              ? 'text-white' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          aria-label="View all items"
          title="Everything"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="4" cy="4" r="2"/>
            <circle cx="12" cy="4" r="2"/>
            <circle cx="20" cy="4" r="2"/>
            <circle cx="4" cy="12" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="20" cy="12" r="2"/>
            <circle cx="4" cy="20" r="2"/>
            <circle cx="12" cy="20" r="2"/>
            <circle cx="20" cy="20" r="2"/>
          </svg>
        </button>
        <button
          onClick={handleShowSpaces}
          className={`relative z-10 px-3 py-3 transition-colors rounded-full flex-1 flex items-center justify-center ${
            viewMode === 'spaces' || viewMode === 'space-detail'
              ? 'text-white' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
          aria-label="View spaces"
          title="Spaces"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </button>
      </div>

      <div className="px-2.5 md:pl-20 md:pr-20 pb-25 md:pb-8">
        {/* Search Bar */}
        <div id="search-section" className="mb-2.5 md:mb-6 pt-5">
          <div className="flex gap-3 items-center">
            <div 
              className={`overflow-hidden transition-all duration-300 ease-out ${
                selectedContentType !== null
                  ? 'max-w-xs opacity-100'
                  : 'max-w-0 opacity-0'
              }`}
            >
              <div 
                id="selected-filter-pill" 
                className="bg-[rgb(255,77,6)] text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap"
              >
                <span className="capitalize">{selectedContentType?.replace(/([A-Z])/g, ' $1').trim()}</span>
                <button
                  onClick={() => setSelectedContentType(null)}
                  className="hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                  aria-label="Clear filter"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="relative flex-1 transition-all duration-300">
              <div className={`absolute left-0 top-0 text-4xl font-serif pb-2 pointer-events-none w-full overflow-hidden whitespace-nowrap transition-opacity duration-200 ease-in-out italic ${
                !searchQuery && !isSearchFocused ? 'opacity-100' : 'opacity-0'
              }`}>
                <span className="font-light text-gray-500 dark:text-gray-600">Search </span>
                <span className="font-medium" style={{ color: '#ff4d06' }}>
                  {viewMode === 'everything' 
                    ? 'everything' 
                    : viewMode === 'spaces'
                      ? 'spaces'
                    : viewMode === 'space-detail' && selectedSpace
                      ? selectedSpaceDetails?.name || 'this space'
                      : 'memex'
                  }...
                </span>
              </div>
              <input
                id="global-search"
                type="text"
                className="w-full text-4xl font-normal bg-transparent outline-none text-gray-900 dark:text-gray-100 font-serif border-b border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 focus:border-gray-700 dark:focus:border-gray-300 transition-colors pb-2 italic placeholder:italic"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsSearchFocused(false), 150);
                }}
              />
            </div>
          </div>

          {/* Content Type Filter Pills */}
          <div 
            id="filter-pills-container" 
            className={`overflow-hidden transition-all duration-300 ease-out ${
              isSearchFocused && viewMode !== 'spaces'
                ? 'max-h-20 opacity-100 mt-4'
                : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <div id="filter-pills" className="flex gap-2 pb-2 overflow-x-auto">
              <button
                onClick={() => setSelectedContentType(null)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedContentType === null
                    ? 'bg-[rgb(255,77,6)] text-white border-[rgb(255,77,6)]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                All Types
              </button>
              
              {getAvailableContentTypes().map((contentType) => (
                <button
                  key={contentType}
                  onClick={() => setSelectedContentType(contentType === selectedContentType ? null : contentType)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap flex-shrink-0 capitalize ${
                    selectedContentType === contentType
                      ? 'bg-[rgb(255,77,6)] text-white border-[rgb(255,77,6)]'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {contentType.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Space Ordering Pills - Only show on spaces page */}
          <div 
            id="space-ordering-container" 
            className={`overflow-hidden transition-all duration-300 ease-out ${
              viewMode === 'spaces'
                ? 'max-h-20 opacity-100 mt-4'
                : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <div id="space-ordering-pills" className="flex gap-2 pb-2 overflow-x-auto">
              <button
                onClick={() => {
                  if (spaceOrderBy === 'alphabetical') {
                    // Toggle direction if already selected
                    setAlphabeticalDirection(alphabeticalDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    // Select alphabetical ordering
                    setSpaceOrderBy('alphabetical');
                  }
                }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                  spaceOrderBy === 'alphabetical'
                    ? 'bg-[rgb(255,77,6)] text-white border-[rgb(255,77,6)]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <span>Alphabetical</span>
                {spaceOrderBy === 'alphabetical' && (
                  <svg 
                    className="w-3 h-3 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ transform: alphabeticalDirection === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => {
                  if (spaceOrderBy === 'created') {
                    // Toggle direction if already selected
                    setCreatedDirection(createdDirection === 'desc' ? 'asc' : 'desc');
                  } else {
                    // Select created ordering
                    setSpaceOrderBy('created');
                  }
                }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                  spaceOrderBy === 'created'
                    ? 'bg-[rgb(255,77,6)] text-white border-[rgb(255,77,6)]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <span>{createdDirection === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                {spaceOrderBy === 'created' && (
                  <svg 
                    className="w-3 h-3 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ transform: createdDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => {
                  if (spaceOrderBy === 'updated') {
                    // Toggle direction if already selected
                    setUpdatedDirection(updatedDirection === 'desc' ? 'asc' : 'desc');
                  } else {
                    // Select updated ordering
                    setSpaceOrderBy('updated');
                  }
                }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                  spaceOrderBy === 'updated'
                    ? 'bg-[rgb(255,77,6)] text-white border-[rgb(255,77,6)]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <span>{updatedDirection === 'desc' ? 'Recently Updated' : 'Least Recently Updated'}</span>
                {spaceOrderBy === 'updated' && (
                  <svg 
                    className="w-3 h-3 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ transform: updatedDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => {
                  if (spaceOrderBy === 'items') {
                    // Toggle direction if already selected
                    setItemsDirection(itemsDirection === 'desc' ? 'asc' : 'desc');
                  } else {
                    // Select items ordering
                    setSpaceOrderBy('items');
                  }
                }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                  spaceOrderBy === 'items'
                    ? 'bg-[rgb(255,77,6)] text-white border-[rgb(255,77,6)]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <span>{itemsDirection === 'desc' ? 'Most Items' : 'Fewest Items'}</span>
                {spaceOrderBy === 'items' && (
                  <svg 
                    className="w-3 h-3 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ transform: itemsDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => setSpaceOrderBy('custom')}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap flex-shrink-0 ${
                  spaceOrderBy === 'custom'
                    ? 'bg-[rgb(255,77,6)] text-white border-[rgb(255,77,6)]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                Custom Order
              </button>
            </div>
          </div>
        </div>

        {/* Masonry Grid */}
        <div 
          id="content-grid" 
          className={`transition-opacity duration-150 ease-in-out ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {viewMode === 'everything' ? (
            /* Infinite scroll grid with integrated NewItemCard */
            <InfiniteScrollGrid
              searchQuery={searchQuery}
              selectedContentType={selectedContentType}
              onItemClick={handleItemClick}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onAddItem={handleAddItem}
              spaces={spaces}
            />
          ) : viewMode === 'spaces' ? (
            <MasonryGrid gap={24} mobileColumns={1}>
              {sortedSpacesWithCounts.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onClick={() => handleSpaceClick(space)}
                  onEdit={handleEditSpace}
                  onDelete={handleDeleteSpace}
                />
              ))}
            </MasonryGrid>
          ) : viewMode === 'space-detail' ? (
            /* Infinite scroll grid for space items with integrated NewItemCard */
            <InfiniteScrollGrid
              spaceId={selectedSpace || undefined}
              searchQuery={searchQuery}
              selectedContentType={selectedContentType}
              onItemClick={handleItemClick}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onAddItem={handleAddItem}
              spaces={spaces}
            />
          ) : null}
        </div>
        
      </div>

      {/* Mobile bottom gradient overlay */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50/80 via-gray-50/40 to-transparent dark:from-gray-900/80 dark:via-gray-900/40 pointer-events-none z-40"></div>

      {/* Floating Action Button */}
      <button
        id="floating-add-button"
        onClick={handleContextAwareAdd}
        className="md:hidden fixed bottom-6 right-6 w-[52px] h-[52px] bg-[rgb(255,77,6)] text-white rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600 hover:bg-[rgb(230,69,5)] hover:border-gray-400 dark:hover:border-gray-500 transition-colors shadow-2xl drop-shadow-lg hover:shadow-xl hover:drop-shadow-xl z-50"
        aria-label={
          viewMode === 'everything' ? 'Add new item' :
          viewMode === 'spaces' ? 'Create new space' :
          'Add item to space'
        }
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modals */}
      <CaptureModal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        onAdd={handleAddItem}
      />

      <ItemDetailModal
        item={selectedItem}
        isOpen={showItemDetail}
        onClose={() => {
          setIsHandlingHash(true);
          setShowItemDetail(false);
          setSelectedItem(null);
          
          // Remove hash from URL
          window.history.replaceState({}, '', window.location.pathname);
          
          // Reset flag after a brief delay
          setTimeout(() => setIsHandlingHash(false), 100);
        }}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onUpdateItem={handleUpdateItem}
        onAddTag={handleAddTagToItem}
        onRemoveTag={handleRemoveTagFromItem}
        spaces={spaces}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userEmail={user?.email}
      />

      <NewSpaceModal
        isOpen={showNewSpaceModal}
        onClose={() => setShowNewSpaceModal(false)}
        onCreateSpace={handleCreateSpace}
      />

      <EditSpaceModal
        isOpen={showEditSpaceModal}
        onClose={() => {
          setShowEditSpaceModal(false);
          setEditingSpace(null);
        }}
        onSubmit={handleUpdateSpace}
        space={editingSpace}
      />

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          {notification}
        </div>
      )}
    </div>
  );
}