'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';
import ContentTypeIcon from './ContentTypeIcon';

interface BookCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function BookCard({ item, onArchive, onDelete, onClick }: BookCardProps) {
  const [showHover, setShowHover] = useState(false);
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
      id={`book-card-${item.id}`}
      className="relative cursor-pointer group hover:scale-[1.02] transition-all duration-200 transform-gpu"
      onClick={handleCardClick}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
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
      
      {/* Book label overlay on hover - bottom right */}
      <div className={`absolute bottom-3 right-3 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 flex items-center gap-2 transition-opacity duration-200 ${showHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <ContentTypeIcon type="book" className="w-4 h-4" />
        <span className="text-sm font-medium">Book</span>
      </div>
    </div>
  );
}