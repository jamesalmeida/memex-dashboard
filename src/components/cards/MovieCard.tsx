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

  // Debug logging
  console.log('MovieCard rendering:', {
    id: item.id,
    hasThumb: !!item.thumbnail_url,
    thumbUrl: item.thumbnail_url,
    imageError,
    title: item.title
  });

  // Fallback if no poster image
  if (!item.thumbnail_url || imageError) {
    return (
      <div 
        id={`movie-card-fallback-${item.id}`}
        className="bg-gray-100 dark:bg-gray-800 aspect-[2/3] flex flex-col items-center justify-center cursor-pointer relative shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 transform-gpu rounded-lg border border-gray-200 dark:border-gray-700"
        onClick={handleCardClick}
        onMouseEnter={() => setShowHover(true)}
        onMouseLeave={() => setShowHover(false)}
      >
        <div className="text-gray-400 dark:text-gray-600 text-center p-4">
          <ContentTypeIcon type={item.content_type === 'tv-show' || item.metadata?.is_tv_show ? 'tv-show' : 'movie'} className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm font-medium">{item.title}</p>
          {item.metadata?.published_date && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ({item.metadata.published_date})
            </p>
          )}
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
    );
  }

  return (
    <div 
      id={`movie-card-${item.id}`}
      className="relative cursor-pointer group overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 transform-gpu aspect-[2/3] rounded-lg border border-gray-200 dark:border-gray-700"
      onClick={handleCardClick}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
    >
      {/* Movie poster - typical 2:3 aspect ratio */}
      <img
        src={item.thumbnail_url}
        alt={item.title || 'Movie poster'}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.log('Movie poster failed to load:', {
            url: item.thumbnail_url,
            error: e
          });
          setImageError(true);
        }}
        onLoad={() => {
          console.log('Movie poster loaded successfully:', item.thumbnail_url);
        }}
        loading="lazy"
      />
      

      {/* Rating badge if available */}
      {item.metadata?.rating && (
        <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white rounded px-2 py-1 text-xs font-medium z-20 flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          {item.metadata.rating}
        </div>
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

      {/* Movie title overlay - bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-20">
        <h3 className="text-sm font-bold leading-tight line-clamp-2 drop-shadow-lg">
          {item.title}
        </h3>
        {item.metadata?.published_date && (
          <p className="text-xs text-gray-200 mt-1">
            ({item.metadata.published_date})
          </p>
        )}
      </div>

      {/* Content type label on hover - bottom right */}
      <div className={`absolute bottom-3 right-3 bg-black bg-opacity-75 text-white rounded px-2 py-1 text-xs font-medium transition-opacity duration-200 ${showHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {item.content_type === 'tv-show' || item.metadata?.is_tv_show ? 'TV' : 'Movie'}
      </div>
    </div>
  );
}