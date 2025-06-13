'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { SignOutButton } from '@/components/SignOutButton';
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
    
    if (viewMode === 'everything') {
      return matchesSearch;
    } else if (viewMode === 'space-detail' && selectedSpace) {
      return matchesSearch && item.space === selectedSpace;
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
  };

  const handleBackToEverything = () => {
    setViewMode('everything');
    setSelectedSpace(null);
  };

  const handleShowSpaces = () => {
    setViewMode('spaces');
    setSelectedSpace(null);
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            <div></div>
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <button
                onClick={handleBackToEverything}
                className={`text-sm font-medium transition-colors ${
                  viewMode === 'everything' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Everything
              </button>
              <button
                onClick={handleShowSpaces}
                className={`text-sm font-medium transition-colors ${
                  viewMode === 'spaces' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Spaces
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Left Rail */}
      <LeftRail onSettingsClick={() => setShowSettingsModal(true)} />

      <div className="px-4 md:pl-20 md:pr-20 py-8">
        {/* Search Bar with New Space Button */}
        <div className="mb-6">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full text-4xl font-light bg-transparent outline-none placeholder-gray-600 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 font-serif border-b border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 focus:border-gray-700 dark:focus:border-gray-300 transition-colors pb-2"
                placeholder={
                  viewMode === 'everything' 
                    ? 'Search everything...' 
                    : viewMode === 'spaces'
                      ? 'Search spaces...'
                    : viewMode === 'space-detail' && selectedSpace 
                      ? `Search ${selectedSpace}...` 
                      : 'Search memex…'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* New Space Button - Only show in Spaces view */}
            {viewMode === 'spaces' && (
              <button
                onClick={() => setShowNewSpaceModal(true)}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Space
              </button>
            )}
          </div>
        </div>

        {/* Space Title for space-detail view */}
        {viewMode === 'space-detail' && selectedSpace && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedSpace}
            </h1>
          </div>
        )}

        {/* Masonry Grid with Different Content Based on View Mode */}
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
        
        {/* Empty state message when no items match search */}
        {viewMode !== 'spaces' && filteredItems.length === 0 && searchQuery && (
          <div className="text-center py-12">
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

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCaptureModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
        aria-label="Add new item"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
