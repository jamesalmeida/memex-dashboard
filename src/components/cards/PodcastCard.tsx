'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';
import ContentTypeIcon from './ContentTypeIcon';

interface PodcastCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function PodcastCard({ item, onArchive, onDelete, onClick }: PodcastCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    onClick?.(item);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  // Fallback if no image
  if (!item.thumbnail_url || imageError) {
    return (
      <div 
        id={`podcast-card-fallback-${item.id}`}
        className="bg-gray-100 dark:bg-gray-800 aspect-square flex items-center justify-center cursor-pointer relative rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 transform-gpu"
        onClick={handleCardClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="text-gray-400 dark:text-gray-600 text-center">
          <ContentTypeIcon type="audio" className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Podcast</p>
        </div>
        
      </div>
    );
  }

  return (
    <div 
      id={`podcast-card-${item.id}`}
      className="relative cursor-pointer group overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 transform-gpu"
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Full height image */}
      <img
        src={item.thumbnail_url}
        alt={item.title || 'Podcast'}
        className="w-full h-auto block"
        onError={() => setImageError(true)}
        loading="lazy"
      />
      
      {/* Podcast label overlay on hover - bottom right */}
      <div className={`absolute bottom-3 right-3 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 flex items-center gap-2 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <ContentTypeIcon type="audio" className="w-4 h-4" />
        <span className="text-sm font-medium">Podcast</span>
      </div>
      

      {/* Space info removed - available in detail modal */}
    </div>
  );
}