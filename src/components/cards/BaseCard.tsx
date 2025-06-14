'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';

interface BaseCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
  children: React.ReactNode;
  showImage?: boolean;
  className?: string;
}

export default function BaseCard({ 
  item, 
  onArchive, 
  onDelete, 
  onClick, 
  children,
  showImage = true,
  className = ''
}: BaseCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const shouldShowFullImage = () => {
    return ['image', 'video', 'instagram', 'tiktok', 'youtube', 'x'].includes(item.content_type);
  };

  const handleCardClick = () => {
    onClick?.(item);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image/Thumbnail Section */}
      {showImage && item.thumbnail_url && !imageError ? (
        <div className="relative">
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className={`w-full object-cover ${
              shouldShowFullImage() ? 'h-48' : 'h-32'
            }`}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {showActions && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button 
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
                onClick={(e) => handleActionClick(e, () => onArchive?.(item.id))}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 0V6a2 2 0 012-2h2a2 2 0 012 2v2l4 0m-6 12V10m0 0l1-1m-1 1l-1-1" />
                </svg>
              </button>
              <button 
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
                onClick={(e) => handleActionClick(e, () => onDelete?.(item.id))}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        // Show action buttons in top right corner for cards without images
        showActions && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <button 
              className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={(e) => handleActionClick(e, () => onArchive?.(item.id))}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 0V6a2 2 0 012-2h2a2 2 0 012 2v2l4 0m-6 12V10m0 0l1-1m-1 1l-1-1" />
              </svg>
            </button>
            <button 
              className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={(e) => handleActionClick(e, () => onDelete?.(item.id))}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )
      )}
      
      {/* Content Area - provided by individual card components */}
      <div className="p-4 flex-1 flex flex-col">
        {children}

        {/* Footer Section - Tags and Space */}
        <div className="mt-auto">
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag.id}
                  className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end text-xs text-gray-500 dark:text-gray-400 min-w-0">
            {item.space && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded truncate max-w-20">
                {item.space.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}