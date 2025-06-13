'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import ItemCard from '@/components/ItemCard';
import CaptureModal from '@/components/CaptureModal';
import ItemDetailModal from '@/components/ItemDetailModal';
import NewItemCard from '@/components/NewItemCard';
import SpaceCard from '@/components/SpaceCard';
import NewSpaceModal from '@/components/NewSpaceModal';
import MasonryGrid from '@/components/MasonryGrid';
import LeftRail from '@/components/LeftRail';
import SettingsModal from '@/components/SettingsModal';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { mockItems, mockSpaces, type MockItem, type MockSpace } from '@/utils/mockData';


export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'everything' | 'spaces' | 'space-detail'>('everything');
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MockItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();

  // Use mock data for now (UI-first approach)
  const [mockItemsState, setMockItemsState] = useState<MockItem[]>(mockItems);
  const [mockSpacesState, setMockSpacesState] = useState<MockSpace[]>(mockSpaces);

  // Calculate space counts dynamically
  const spaceCounts = mockSpacesState.map(space => ({
    ...space,
    count: mockItemsState.filter(item => item.space === space.name).length
  }));

  // Get unique content types from current items (filtered by space if applicable)
  const getAvailableContentTypes = () => {
    const relevantItems = viewMode === 'space-detail' && selectedSpace 
      ? mockItemsState.filter(item => item.space === selectedSpace)
      : mockItemsState;
    
    const types = [...new Set(relevantItems.map(item => item.content_type))];
    return types.sort();
  };

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // TODO: Load real items from Supabase in future checkpoint
      // For now using mock data for UI development

      setLoading(false);
    };

    checkUserAndLoadData();
  }, [router]);

  const filteredItems = mockItemsState.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesContentType = selectedContentType === null || item.content_type === selectedContentType;
    
    if (viewMode === 'everything') {
      return matchesSearch && matchesContentType;
    } else if (viewMode === 'space-detail' && selectedSpace) {
      return matchesSearch && matchesContentType && item.space === selectedSpace;
    }
    
    return false; // For spaces view, we don't show items
  });

  const handleArchive = (id: string) => {
    console.log('Archive item:', id);
  };

  const handleDelete = (id: string) => {
    setMockItemsState(items => items.filter(item => item.id !== id));
  };

  const handleMoveToSpace = (id: string, spaceId: string) => {
    console.log('Move item to space:', id, spaceId);
  };

  const handleSpaceClick = (space: MockSpace) => {
    setSelectedSpace(space.name);
    setViewMode('space-detail');
    setSelectedContentType(null);
  };

  const handleBackToEverything = () => {
    setViewMode('everything');
    setSelectedSpace(null);
    setSelectedContentType(null);
  };

  const handleShowSpaces = () => {
    setViewMode('spaces');
    setSelectedSpace(null);
    setSelectedContentType(null);
  };

  const handleHomeClick = () => {
    setViewMode('everything');
    setSelectedSpace(null);
    setSelectedContentType(null);
    setSearchQuery('');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContextAwareAdd = () => {
    if (viewMode === 'everything') {
      // Add new item
      setShowCaptureModal(true);
    } else if (viewMode === 'spaces') {
      // Create new space
      setShowNewSpaceModal(true);
    } else if (viewMode === 'space-detail') {
      // Add item to current space
      setShowCaptureModal(true);
    }
  };

  const handleCreateSpace = (newSpaceData: Omit<MockSpace, 'id' | 'count'>) => {
    const newSpace: MockSpace = {
      ...newSpaceData,
      id: Date.now().toString(),
      count: 0
    };
    
    setMockSpacesState(spaces => [...spaces, newSpace]);
    setNotification('Space created successfully!');
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddItem = (newItemData: Omit<MockItem, 'id' | 'created_at'>, openDetail: boolean = false) => {
    const newItem: MockItem = {
      ...newItemData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      // If we're in a space detail view, assign the item to that space
      space: viewMode === 'space-detail' && selectedSpace ? selectedSpace : newItemData.space
    };
    
    setMockItemsState(items => [newItem, ...items]);
    setNotification('Item added successfully!');
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
    
    // Open detail modal for quick-added items
    if (openDetail) {
      setSelectedItem(newItem);
      setShowItemDetail(true);
    }
    
    return newItem;
  };

  const handleItemClick = (item: MockItem) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  const handleUpdateItem = (id: string, updates: Partial<MockItem>) => {
    setMockItemsState(items => 
      items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
    
    // Update selected item if it's being viewed
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, ...updates } : prev);
    }
  };

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
      {/* Header - removed since navigation is now inline with search */}

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
      <div id="floating-navigation-toggle" className="md:hidden fixed bottom-6 left-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-1 flex items-center h-[52px] w-[120px] shadow-lg z-50">
        {/* Sliding pill background */}
        <div 
          className="absolute h-[calc(100%-8px)] bg-[rgb(255,77,6)] rounded-full transition-all duration-200 ease-out"
          style={{
            width: 'calc(50% - 4px)',
            left: viewMode === 'everything' ? '4px' : 'calc(50%)',
          }}
        />
        
        {/* Toggle buttons */}
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
          {/* Grid icon - 3x3 dots */}
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
          {/* 3D cube icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </button>
      </div>

      <div className="px-4 md:pl-20 md:pr-20 pb-8">
        {/* Search Bar with New Space Button */}
        <div id="search-section" className="mb-6 pt-5">
          <div className="flex gap-3 items-center">
            {/* Selected Content Type Indicator */}
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
              {/* Custom placeholder overlay */}
              {!searchQuery && !isSearchFocused && (
                <div className="absolute left-0 top-0 text-4xl font-serif pb-2 pointer-events-none w-full overflow-hidden whitespace-nowrap">
                  <span className="font-light text-gray-500 dark:text-gray-600">Search </span>
                  <span className="font-medium" style={{ color: '#ff4d06' }}>
                    {viewMode === 'everything' 
                      ? 'everything' 
                      : viewMode === 'spaces'
                        ? 'spaces'
                      : viewMode === 'space-detail' && selectedSpace 
                        ? selectedSpace 
                        : 'memex'
                    }...
                  </span>
                </div>
              )}
              <input
                type="text"
                className="w-full text-4xl font-light bg-transparent outline-none text-gray-900 dark:text-gray-100 font-serif border-b border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 focus:border-gray-700 dark:focus:border-gray-300 transition-colors pb-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  // Delay blur to allow pill clicks
                  setTimeout(() => setIsSearchFocused(false), 150);
                }}
              />
            </div>
            
          </div>

          {/* Content Type Filter Pills - Show when search is focused and not in spaces view */}
          {isSearchFocused && viewMode !== 'spaces' && (
            <div id="filter-pills-container" className="mt-4 overflow-x-auto">
              <div id="filter-pills" className="flex gap-2 pb-2">
                {/* All Types pill */}
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
                
                {/* Individual content type pills */}
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
          )}
        </div>


        {/* Masonry Grid with Different Content Based on View Mode */}
        <div id="content-grid">
          <MasonryGrid gap={16}>
          {viewMode === 'everything' && (
            <>
              {/* New Item Card - Position 1 */}
              <NewItemCard onAdd={(item) => handleAddItem(item, false)} />
              
              {/* Existing Items - Positions 2+ */}
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
              {/* Space Cards */}
              {spaceCounts.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onClick={handleSpaceClick}
                />
              ))}
            </>
          )}

          {viewMode === 'space-detail' && (
            <>
              {/* New Item Card - Position 1 */}
              <NewItemCard onAdd={(item) => handleAddItem(item, false)} />
              
              {/* Items in Selected Space - Positions 2+ */}
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
        
        {/* Empty state message when no items match search */}
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

      {/* Floating Action Button - Mobile only, desktop uses left rail button */}
      <button
        id="floating-add-button"
        onClick={handleContextAwareAdd}
        className="md:hidden fixed bottom-6 right-6 w-[52px] h-[52px] bg-[rgb(255,77,6)] text-white rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600 hover:bg-[rgb(230,69,5)] hover:border-gray-400 dark:hover:border-gray-500 transition-colors shadow-lg hover:shadow-xl z-50"
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

      {/* Capture Modal */}
      <CaptureModal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        onAdd={handleAddItem}
      />

      {/* Item Detail Modal */}
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
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userEmail={user?.email}
      />

      {/* New Space Modal */}
      <NewSpaceModal
        isOpen={showNewSpaceModal}
        onClose={() => setShowNewSpaceModal(false)}
        onCreateSpace={handleCreateSpace}
      />

      {/* Success Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          {notification}
        </div>
      )}
    </div>
  );
}
