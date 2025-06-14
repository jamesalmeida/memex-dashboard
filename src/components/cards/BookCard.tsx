'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';

interface BookCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function BookCard({ item, onArchive, onDelete, onClick }: BookCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    onClick?.(item);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className="relative cursor-pointer group"
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Book-like 3D effect */}
      <div className="relative transform transition-transform duration-200 hover:scale-105">
        {/* Book spine shadow */}
        <div className="absolute -right-1 top-1 w-full h-full bg-gray-800 dark:bg-gray-900 rounded-r-sm transform skew-y-1"></div>
        
        {/* Main book cover */}
        <div className="relative bg-white dark:bg-gray-800 rounded-sm shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ aspectRatio: '2/3', width: '200px' }}>
          {/* Book cover image */}
          {item.thumbnail_url && !imageError ? (
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            /* Fallback book cover design */
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col justify-between p-4">
              <div className="text-white">
                <h3 className="text-sm font-bold leading-tight mb-2 line-clamp-4">
                  {item.title}
                </h3>
              </div>
              <div className="text-white/80">
                <p className="text-xs">
                  {item.metadata?.author || 'Unknown Author'}
                </p>
              </div>
            </div>
          )}
          
          {/* Minimal overlay info for books with cover images */}
          {item.thumbnail_url && !imageError && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <h3 className="text-white text-xs font-medium line-clamp-2 mb-1">
                {item.title}
              </h3>
              {item.metadata?.author && (
                <p className="text-white/80 text-xs">
                  {item.metadata.author}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          {showActions && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button 
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
                onClick={(e) => handleActionClick(e, () => onArchive?.(item.id))}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 0V6a2 2 0 012-2h2a2 2 0 012 2v2l4 0m-6 12V10m0 0l1-1m-1 1l-1-1" />
                </svg>
              </button>
              <button 
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
                onClick={(e) => handleActionClick(e, () => onDelete?.(item.id))}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}

          {/* Space tag in corner if present */}
          {item.space && (
            <div className="absolute bottom-2 left-2">
              <span className="text-xs bg-white/90 dark:bg-black/90 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                {item.space.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}