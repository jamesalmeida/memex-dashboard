'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';
import ContentTypeIcon from './ContentTypeIcon';

interface MovieCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function MovieCard({ item, onArchive, onDelete, onClick }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showHover, setShowHover] = useState(false);

  const handleCardClick = () => {
    onClick?.(item);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };


  // Fallback if no poster image
  if (!item.thumbnail_url || imageError) {
    return (
      <div 
        className="flex flex-col hover:scale-[1.02] transition-all duration-200 transform-gpu"
        onMouseEnter={() => setShowHover(true)}
        onMouseLeave={() => setShowHover(false)}
      >
        <div 
          id={`movie-card-fallback-${item.id}`}
          className="bg-gray-100 dark:bg-gray-800 aspect-[2/3] flex flex-col items-center justify-center cursor-pointer relative shadow-sm hover:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
          onClick={handleCardClick}
        >
          <div className="text-gray-400 dark:text-gray-600 text-center p-4">
            <ContentTypeIcon type={item.content_type === 'tv-show' || item.metadata?.is_tv_show ? 'tv-show' : 'movie'} className="w-12 h-12 mx-auto mb-2" />
            {item.metadata?.rating && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="text-yellow-500">★</span>
                <span className="text-xs">{item.metadata.rating}</span>
              </div>
            )}
          </div>
          
          {/* Rating badge if available */}
          {item.metadata?.rating && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white rounded px-2 py-1 text-xs font-medium z-20 flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              {item.metadata.rating}
            </div>
          )}
        </div>
        
        {/* Title below the card */}
        <h3 id={`movie-card-fallback-title-${item.id}`} className="mt-1 text-sm font-normal text-gray-900 dark:text-gray-100 text-center truncate">
          {item.title}
          {item.metadata?.published_date && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({item.metadata.published_date})
            </span>
          )}
        </h3>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col hover:scale-[1.02] transition-all duration-200 transform-gpu"
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
    >
      <div 
        id={`movie-card-${item.id}`}
        className="relative cursor-pointer group overflow-hidden shadow-sm hover:shadow-lg aspect-[2/3] rounded-lg border border-gray-200 dark:border-gray-700"
        onClick={handleCardClick}
      >
        {/* Movie poster - typical 2:3 aspect ratio */}
        <img
          src={item.thumbnail_url}
          alt={item.title || 'Movie poster'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Rating badge if available */}
        {item.metadata?.rating && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white rounded px-2 py-1 text-xs font-medium z-20 flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            {item.metadata.rating}
          </div>
        )}

        {/* Content type label on hover - bottom right */}
        <div className={`absolute bottom-3 right-3 bg-black bg-opacity-75 text-white rounded px-2 py-1 text-xs font-medium transition-opacity duration-200 ${showHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {item.content_type === 'tv-show' || item.metadata?.is_tv_show ? 'TV' : 'Movie'}
        </div>
      </div>
      
      {/* Title below the card */}
      <h3 id={`movie-card-title-${item.id}`} className="mt-1 text-sm font-normal text-gray-900 dark:text-gray-100 text-center truncate">
        {item.title}
        {item.metadata?.published_date && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            ({item.metadata.published_date})
          </span>
        )}
      </h3>
    </div>
  );
}