'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { SignOutButton } from '@/components/SignOutButton';
import ItemCard from '@/components/ItemCard';
import CaptureModal from '@/components/CaptureModal';
import ItemDetailModal from '@/components/ItemDetailModal';
import NewItemCard from '@/components/NewItemCard';
import MasonryGrid from '@/components/MasonryGrid';
import LeftRail from '@/components/LeftRail';
import SettingsModal from '@/components/SettingsModal';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { mockItems, mockProjects, type MockItem } from '@/utils/mockData';


export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MockItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();

  // Use mock data for now (UI-first approach)
  const [mockItemsState, setMockItemsState] = useState<MockItem[]>(mockItems);

  // Calculate project counts dynamically
  const projectCounts = mockProjects.map(project => ({
    ...project,
    count: mockItemsState.filter(item => item.project === project.name).length
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
    
    const matchesProject = selectedProject === 'all' || item.project === selectedProject;
    
    return matchesSearch && matchesProject;
  });

  const handleArchive = (id: string) => {
    console.log('Archive item:', id);
  };

  const handleDelete = (id: string) => {
    setMockItemsState(items => items.filter(item => item.id !== id));
  };

  const handleMoveToProject = (id: string, projectId: string) => {
    console.log('Move item to project:', id, projectId);
  };

  const handleAddItem = (newItemData: Omit<MockItem, 'id' | 'created_at'>, openDetail: boolean = false) => {
    const newItem: MockItem = {
      ...newItemData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Empty header for now */}
          </div>
        </div>
      </header>

      {/* Left Rail */}
      <LeftRail onSettingsClick={() => setShowSettingsModal(true)} />

      <div className="px-4 md:pl-20 md:pr-20 py-8">
        {/* Search Bar - Full width */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search your items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Masonry Grid with Left-to-Right Order */}
        <MasonryGrid gap={16}>
          {/* Project Selector Card - Position 1 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Projects</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedProject('all')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedProject === 'all' 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Items ({mockItemsState.length})
              </button>
              {projectCounts.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                    selectedProject === project.name 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <span className="truncate">{project.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">({project.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* New Item Card - Position 2 */}
          <NewItemCard onAdd={(item) => handleAddItem(item, false)} />
          
          {/* Existing Items - Positions 3+ */}
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onMoveToProject={handleMoveToProject}
              onClick={handleItemClick}
            />
          ))}
        </MasonryGrid>
        
        {/* Empty state message when no items match search */}
        {filteredItems.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p className="mt-1 text-sm text-gray-500">
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

      {/* Success Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          {notification}
        </div>
      )}
    </div>
  );
}
