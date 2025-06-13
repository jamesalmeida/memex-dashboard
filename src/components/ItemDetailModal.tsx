'use client'

import { useState, useEffect } from 'react';
import { MockItem, mockSpaces } from '@/utils/mockData';
import Modal from './Modal';

interface ItemDetailModalProps {
  item: MockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: MockItem) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onUpdateItem?: (id: string, updates: Partial<MockItem>) => void;
}

const ContentTypeIcon = ({ type }: { type: MockItem['content_type'] }) => {
  const iconClass = "w-5 h-5 flex-shrink-0";
  
  switch (type) {
    case 'link':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case 'video':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'image':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'pdf':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'text':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'tweet':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
};

export default function ItemDetailModal({ 
  item, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onArchive,
  onUpdateItem 
}: ItemDetailModalProps) {
  const [newTag, setNewTag] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [currentItem, setCurrentItem] = useState<MockItem | null>(null);

  useEffect(() => {
    if (item && isOpen) {
      setCurrentItem(item);
      setTags(item.metadata?.tags || []);
      setSelectedSpace(item.space || 'none');
    }
  }, [item, isOpen]);

  // Don't render if never opened or no item data
  if (!currentItem) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const handleOpenUrl = () => {
    if (currentItem.url) {
      window.open(currentItem.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      onUpdateItem?.(currentItem.id, { 
        metadata: { ...currentItem.metadata, tags: updatedTags } 
      });
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    onUpdateItem?.(currentItem.id, { 
      metadata: { ...currentItem.metadata, tags: updatedTags } 
    });
  };

  const handleSpaceChange = (newSpace: string) => {
    setSelectedSpace(newSpace);
    onUpdateItem?.(currentItem.id, { 
      space: newSpace === 'none' ? undefined : newSpace 
    });
  };

  const handleGenerateTranscript = () => {
    console.log('Generate transcript for video:', currentItem.id);
    // Placeholder for future implementation
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      modalId="item-detail-modal"
      title={
        <div className="flex items-center gap-3">
          <ContentTypeIcon type={currentItem.content_type} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
              {currentItem.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {currentItem.content_type}
              {currentItem.metadata?.domain && (
                <>
                  <span className="mx-1">•</span>
                  {currentItem.metadata.domain}
                </>
              )}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Two-Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column - Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
          {/* Thumbnail */}
          {currentItem.thumbnail && (
            <div className="mb-6">
              <img 
                src={currentItem.thumbnail} 
                alt={currentItem.title}
                className="w-full h-48 object-cover rounded-lg bg-gray-100"
              />
            </div>
          )}

          {/* URL */}
          {currentItem.url && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 break-all">
                  {currentItem.url}
                </div>
                <button
                  onClick={handleOpenUrl}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open
                </button>
              </div>
            </div>
          )}

          {/* Content-Type Specific Sections */}
          {currentItem.content_type === 'youtube' && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-medium text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube Video
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {currentItem.metadata?.duration && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.duration}</span>
                    </div>
                  )}
                  {currentItem.metadata?.views && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Views:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.views.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateTranscript}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Get Transcript
                  </button>
                  <button className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Watch Later
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentItem.content_type === 'github' && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub Repository
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {currentItem.metadata?.stars && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Stars:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.stars.toLocaleString()}</span>
                    </div>
                  )}
                  {currentItem.metadata?.forks && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Forks:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.forks.toLocaleString()}</span>
                    </div>
                  )}
                  {currentItem.metadata?.language && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Language:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.language}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Clone Repo
                  </button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Star
                  </button>
                </div>
              </div>
            </div>
          )}

          {(currentItem.content_type === 'amazon' || currentItem.content_type === 'product') && (
            <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Product
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {currentItem.metadata?.price && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="ml-2 font-medium text-green-600 dark:text-green-400">{currentItem.metadata.price}</span>
                    </div>
                  )}
                  {currentItem.metadata?.rating && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.rating}/5 ⭐</span>
                    </div>
                  )}
                  {currentItem.metadata?.reviews && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Reviews:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.reviews.toLocaleString()}</span>
                    </div>
                  )}
                  {currentItem.metadata?.in_stock !== undefined && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                      <span className={`ml-2 font-medium ${currentItem.metadata.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                        {currentItem.metadata.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 12.5l6 6 9-13.5" />
                    </svg>
                    Price Alert
                  </button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Wishlist
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentItem.content_type === 'article' && (
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Article
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  {currentItem.metadata?.published_date && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Published:</span>
                      <span className="ml-2 font-medium">{new Date(currentItem.metadata.published_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Summarize
                  </button>
                  <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark Read
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {currentItem.description && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <p className="text-gray-600 leading-relaxed">
                {currentItem.description}
              </p>
            </div>
          )}
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="w-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800/50">
          {/* Metadata */}
          <div className="space-y-4 mb-4">
            {/* Space */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Space
              </label>
              <select
                value={selectedSpace}
                onChange={(e) => handleSpaceChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">No space</option>
                {mockSpaces.map((space) => (
                  <option key={space.id} value={space.name}>
                    {space.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration (for videos) */}
            {currentItem.metadata?.duration && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <span className="text-gray-600 text-sm">
                  {currentItem.metadata.duration}
                </span>
              </div>
            )}

            {/* File size (for PDFs) */}
            {currentItem.metadata?.file_size && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Size
                </label>
                <span className="text-gray-600 text-sm">
                  {currentItem.metadata.file_size}
                </span>
              </div>
            )}

            {/* Page count (for PDFs) */}
            {currentItem.metadata?.page_count && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pages
                </label>
                <span className="text-gray-600 text-sm">
                  {currentItem.metadata.page_count} pages
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {showTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    onBlur={() => {
                      if (!newTag.trim()) setShowTagInput(false);
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Add tag..."
                    autoFocus
                  />
                  <button
                    onClick={handleAddTag}
                    className="p-1 text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-gray-400 hover:text-gray-600"
                >
                  + Add tag
                </button>
              )}
            </div>
          </div>

          {/* Created date */}
          <div className="text-sm text-gray-500 border-t pt-4">
            Added on {formatDate(currentItem.created_at)}
          </div>
          </div>
        </div>

        {/* Fixed Actions Bar */}
        <div id="modal-actions" className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(currentItem)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Edit
              </button>
            )}
            {onArchive && (
              <button
                onClick={() => onArchive(currentItem.id)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Archive
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(currentItem.id)}
                className="px-4 py-2 text-sm text-white bg-red-600 dark:bg-red-700 rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}