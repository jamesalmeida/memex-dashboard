'use client'

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import ItemCard from '@/components/ItemCard';
import CaptureModal from '@/components/CaptureModal';
import ItemDetailModal from '@/components/ItemDetailModal';
import NewItemCard from '@/components/NewItemCard';
import SpaceCard from '@/components/SpaceCard';
import NewSpaceModal from '@/components/NewSpaceModal';
import EditSpaceModal from '@/components/EditSpaceModal';
import MasonryGrid from '@/components/MasonryGrid';
import LeftRail from '@/components/LeftRail';
import SettingsModal from '@/components/SettingsModal';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { itemsService, spacesService, tagsService } from '@/lib/supabase/services';
import type { ItemWithMetadata, Space, ContentType } from '@/types/database';
import type { MockItem } from '@/utils/mockData';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'everything' | 'spaces' | 'space-detail'>('everything');
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemWithMetadata | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);
  const [showEditSpaceModal, setShowEditSpaceModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();

  // Real data from Supabase
  const [items, setItems] = useState<ItemWithMetadata[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesWithCounts, setSpacesWithCounts] = useState<(Space & { item_count: number })[]>([]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Load spaces and items
        const [spacesData, spacesWithCountsData, itemsData] = await Promise.all([
          spacesService.getSpaces(),
          spacesService.getSpacesWithCounts(),
          itemsService.getItems()
        ]);

        setSpaces(spacesData);
        setSpacesWithCounts(spacesWithCountsData);
        setItems(itemsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Get unique content types from current items
  const getAvailableContentTypes = () => {
    const relevantItems = viewMode === 'space-detail' && selectedSpace 
      ? items.filter(item => item.space_id === selectedSpace)
      : items;
    
    const types = [...new Set(relevantItems.map(item => item.content_type))];
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
      await itemsService.archiveItem(id);
      setItems(items.filter(item => item.id !== id));
      setShowItemDetail(false);
      setSelectedItem(null);
      
      // Update spaces with counts
      const updatedSpacesWithCounts = await spacesService.getSpacesWithCounts();
      setSpacesWithCounts(updatedSpacesWithCounts);
      
      setNotification('Item archived successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error archiving item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await itemsService.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
      setShowItemDetail(false);
      setSelectedItem(null);
      
      // Update spaces with counts
      const updatedSpacesWithCounts = await spacesService.getSpacesWithCounts();
      setSpacesWithCounts(updatedSpacesWithCounts);
      
      setNotification('Item deleted successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleMoveToSpace = async (id: string, spaceId: string) => {
    try {
      await itemsService.updateItem(id, { space_id: spaceId });
      const updatedItem = await itemsService.getItem(id);
      if (updatedItem) {
        setItems(items.map(item => item.id === id ? updatedItem : item));
        if (selectedItem?.id === id) {
          setSelectedItem(updatedItem);
        }
        
        // Update spaces with counts
        const updatedSpacesWithCounts = await spacesService.getSpacesWithCounts();
        setSpacesWithCounts(updatedSpacesWithCounts);
      }
    } catch (error) {
      console.error('Error moving item to space:', error);
    }
  };

  const handleSpaceClick = (space: Space) => {
    setSelectedSpace(space.id);
    setViewMode('space-detail');
    setSelectedContentType(null);
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
      
      // Update local state
      setSpaces(spaces.filter(s => s.id !== space.id));
      setSpacesWithCounts(spacesWithCounts.filter(s => s.id !== space.id));
      
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
      
      // Reload spaces to get updated data
      const [updatedSpaces, updatedSpacesWithCounts] = await Promise.all([
        spacesService.getSpaces(),
        spacesService.getSpacesWithCounts()
      ]);
      
      setSpaces(updatedSpaces);
      setSpacesWithCounts(updatedSpacesWithCounts);
      
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
    setViewMode('everything');
    setSelectedSpace(null);
    setSelectedContentType(null);
  }, []);

  const handleShowSpaces = useCallback(() => {
    setViewMode('spaces');
    setSelectedSpace(null);
    setSelectedContentType(null);
  }, []);

  const handleHomeClick = () => {
    setViewMode('everything');
    setSelectedSpace(null);
    setSelectedContentType(null);
    setSearchQuery('');
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
          // Clear search and unfocus
          setSearchQuery('');
          (activeElement as HTMLElement)?.blur();
          event.preventDefault();
          return;
        }
        
        if (isSearchFocused && !searchQuery) {
          // Just unfocus if search is empty
          (activeElement as HTMLElement)?.blur();
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
      showEditSpaceModal, searchQuery, viewMode, handleShowSpaces, handleBackToEverything]);

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
      setSpaces([...spaces, newSpace]);
      
      // Update spaces with counts
      const updatedSpacesWithCounts = await spacesService.getSpacesWithCounts();
      setSpacesWithCounts(updatedSpacesWithCounts);
      
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
      
      // Fetch the full item with metadata
      const fullItem = await itemsService.getItem(newItem.id);
      if (fullItem) {
        setItems([fullItem, ...items]);
        
        // Update spaces with counts
        const updatedSpacesWithCounts = await spacesService.getSpacesWithCounts();
        setSpacesWithCounts(updatedSpacesWithCounts);
        
        setNotification('Item added successfully!');
        setTimeout(() => setNotification(null), 3000);
        
        if (openDetail) {
          setSelectedItem(fullItem);
          setShowItemDetail(true);
        }
        
        return fullItem;
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleItemClick = (item: ItemWithMetadata) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  const handleUpdateItem = async (id: string, updates: Partial<MockItem>) => {
    try {
      // Convert updates to database format
      const updateInput = {
        title: updates.title,
        url: updates.url,
        content_type: updates.content_type as ContentType,
        description: updates.description,
        thumbnail_url: updates.thumbnail_url || updates.thumbnail,
        space_id: updates.space ? spaces.find(s => s.name === updates.space)?.id : null
      };

      await itemsService.updateItem(id, updateInput);
      const updatedItem = await itemsService.getItem(id);
      
      if (updatedItem) {
        setItems(items.map(item => item.id === id ? updatedItem : item));
        if (selectedItem?.id === id) {
          setSelectedItem(updatedItem);
        }
        
        // Update spaces with counts if space changed
        if (updateInput.space_id !== undefined) {
          const updatedSpacesWithCounts = await spacesService.getSpacesWithCounts();
          setSpacesWithCounts(updatedSpacesWithCounts);
        }
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleAddTagToItem = async (itemId: string, tagName: string) => {
    try {
      // Create or get the tag
      const tag = await tagsService.getOrCreateTag(tagName);
      
      // Add the tag to the item
      await itemsService.addTagsToItem(itemId, [tag.id]);
      
      // Refresh the item data
      const updatedItem = await itemsService.getItem(itemId);
      if (updatedItem) {
        setItems(items.map(item => item.id === itemId ? updatedItem : item));
        if (selectedItem?.id === itemId) {
          setSelectedItem(updatedItem);
        }
      }
    } catch (error) {
      console.error('Error adding tag to item:', error);
    }
  };

  const handleRemoveTagFromItem = async (itemId: string, tagId: string) => {
    try {
      await itemsService.removeTagsFromItem(itemId, [tagId]);
      
      // Refresh the item data
      const updatedItem = await itemsService.getItem(itemId);
      if (updatedItem) {
        setItems(items.map(item => item.id === itemId ? updatedItem : item));
        if (selectedItem?.id === itemId) {
          setSelectedItem(updatedItem);
        }
      }
    } catch (error) {
      console.error('Error removing tag from item:', error);
    }
  };

  // Get selected space details
  const selectedSpaceDetails = selectedSpace ? spaces.find(s => s.id === selectedSpace) : null;

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

      {/* Floating Navigation Toggle - Mobile only */}
      <div id="floating-navigation-toggle" className="md:hidden fixed bottom-6 left-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-1 flex items-center h-[52px] w-[120px] shadow-2xl drop-shadow-lg z-50">
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

      <div className="px-2.5 md:pl-20 md:pr-20 pb-4 md:pb-8">
        {/* Search Bar */}
        <div id="search-section" className="mb-2.5 md:mb-6 pt-5">
          <div className="flex gap-3 items-center">
            {selectedContentType && (
              <div id="selected-filter-pill" className="bg-[rgb(255,77,6)] text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">
                <span className="capitalize">{selectedContentType.replace(/([A-Z])/g, ' $1').trim()}</span>
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
            )}
            
            <div className="relative flex-1">
              <div className={`absolute left-0 top-0 text-2xl md:text-4xl font-serif pb-2 pointer-events-none w-full overflow-hidden whitespace-nowrap transition-opacity duration-200 ease-in-out ${
                !searchQuery && !isSearchFocused ? 'opacity-100' : 'opacity-0'
              }`}>
                <span className="font-light text-gray-500 dark:text-gray-600">Search </span>
                <span className="font-medium" style={{ color: '#ff4d06' }}>
                  {viewMode === 'everything' 
                    ? 'everything' 
                    : viewMode === 'spaces'
                      ? 'spaces'
                    : viewMode === 'space-detail' && selectedSpaceDetails 
                      ? selectedSpaceDetails.name 
                      : 'memex'
                  }...
                </span>
              </div>
              <input
                id="global-search"
                type="text"
                className="w-full text-2xl md:text-4xl font-light bg-transparent outline-none text-gray-900 dark:text-gray-100 font-serif border-b border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 focus:border-gray-700 dark:focus:border-gray-300 transition-colors pb-2"
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
        </div>

        {/* Masonry Grid */}
        <div id="content-grid">
          <MasonryGrid gap={24}>
          {viewMode === 'everything' && (
            <>
              {/* NewItemCard inside grid on desktop */}
              <div className="hidden md:block">
                <NewItemCard onAdd={(item) => handleAddItem(item, false)} />
              </div>
              
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onMoveToProject={handleMoveToSpace}
                  onClick={handleItemClick}
                />
              ))}
            </>
          )}

          {viewMode === 'spaces' && (
            <>
              {spacesWithCounts.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onClick={() => handleSpaceClick(space)}
                  onEdit={handleEditSpace}
                  onDelete={handleDeleteSpace}
                />
              ))}
            </>
          )}

          {viewMode === 'space-detail' && (
            <>
              {/* NewItemCard inside grid on desktop */}
              <div className="hidden md:block">
                <NewItemCard onAdd={(item) => handleAddItem(item, false)} />
              </div>
              
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onMoveToProject={handleMoveToSpace}
                  onClick={handleItemClick}
                />
              ))}
            </>
          )}
          </MasonryGrid>
        </div>
        
        {/* Empty state */}
        {viewMode !== 'spaces' && filteredItems.length === 0 && searchQuery && (
          <div id="empty-state" className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No items found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No items match &ldquo;{searchQuery}&rdquo;. Try a different search term.
            </p>
          </div>
        )}
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
          setShowItemDetail(false);
          setSelectedItem(null);
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