'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { SignOutButton } from '@/components/SignOutButton';
import ItemCard from '@/components/ItemCard';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { mockItems, mockProjects, type MockItem } from '@/utils/mockData';

interface Item {
  id: string;
  title: string | null;
  url: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const router = useRouter();

  // Use mock data for now (UI-first approach)
  const [mockItemsState, setMockItemsState] = useState<MockItem[]>(mockItems);

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
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Memex</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar - Above everything on mobile */}
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
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
                {mockProjects.map((project) => (
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
          </aside>

          {/* Main Content */}
          <main className="flex-1">

            {/* Items Grid */}
            {filteredItems.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-2 xl:columns-3 gap-4 space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="break-inside-avoid">
                    <ItemCard
                      item={item}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onMoveToProject={handleMoveToProject}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14c2-2 6-2 8 0V6a2 2 0 00-2-2zM9 7h6M9 11h6m-6 4h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? `No items match "${searchQuery}"` : 'Start by adding your first item to get organized.'}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
