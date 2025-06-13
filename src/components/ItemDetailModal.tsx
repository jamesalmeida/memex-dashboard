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

  useEffect(() => {
    if (item) {
      setTags(item.metadata?.tags || []);
      setSelectedSpace(item.space || 'none');
    }
  }, [item]);

  if (!isOpen || !item) return null;

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
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      onUpdateItem?.(item.id, { 
        metadata: { ...item.metadata, tags: updatedTags } 
      });
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    onUpdateItem?.(item.id, { 
      metadata: { ...item.metadata, tags: updatedTags } 
    });
  };

  const handleSpaceChange = (newSpace: string) => {
    setSelectedSpace(newSpace);
    onUpdateItem?.(item.id, { 
      space: newSpace === 'none' ? undefined : newSpace 
    });
  };

  const handleGenerateTranscript = () => {
    console.log('Generate transcript for video:', item.id);
    // Placeholder for future implementation
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      modalId="item-detail-modal"
      title={
        <div className="flex items-center gap-3">
          <ContentTypeIcon type={item.content_type} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
              {item.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {item.content_type}
              {item.metadata?.domain && (
                <>
                  <span className="mx-1">•</span>
                  {item.metadata.domain}
                </>
              )}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Thumbnail */}
          {item.thumbnail && (
            <div className="mb-6">
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg bg-gray-100"
              />
            </div>
          )}

          {/* URL */}
          {item.url && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 break-all">
                  {item.url}
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

          {/* Generate Transcript Button for Videos */}
          {item.content_type === 'video' && (
            <div className="mb-4">
              <button
                onClick={handleGenerateTranscript}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Transcript
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                AI-powered transcript generation (coming soon)
              </p>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Space */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
            {item.metadata?.duration && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <span className="text-gray-600 text-sm">
                  {item.metadata.duration}
                </span>
              </div>
            )}

            {/* File size (for PDFs) */}
            {item.metadata?.file_size && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Size
                </label>
                <span className="text-gray-600 text-sm">
                  {item.metadata.file_size}
                </span>
              </div>
            )}

            {/* Page count (for PDFs) */}
            {item.metadata?.page_count && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pages
                </label>
                <span className="text-gray-600 text-sm">
                  {item.metadata.page_count} pages
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            Added on {formatDate(item.created_at)}
          </div>
        </div>

        {/* Fixed Actions Bar */}
        <div id="modal-actions" className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Edit
              </button>
            )}
            {onArchive && (
              <button
                onClick={() => {
                  onArchive(item.id);
                  onClose();
                }}
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
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
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