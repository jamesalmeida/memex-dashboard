'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';

interface ImageCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function ImageCard({ item, onArchive, onDelete, onClick }: ImageCardProps) {
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
        id={`image-card-fallback-${item.id}`}
        className="bg-gray-100 dark:bg-gray-800 aspect-square flex items-center justify-center cursor-pointer relative shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 transform-gpu rounded-lg"
        style={{ border: '10px solid var(--image-frame-color)' }}
        onClick={handleCardClick}
      >
        <div className="text-gray-400 dark:text-gray-600 text-center">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No Image</p>
        </div>
        
      </div>
    );
  }

  return (
    <div 
      id={`image-card-${item.id}`}
      className="relative cursor-pointer group overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 transform-gpu rounded-lg"
      style={{ border: '10px solid var(--image-frame-color)' }}
      onClick={handleCardClick}
    >
      {/* Image - full natural size with sharp corners */}
      <img
        src={item.thumbnail_url}
        alt={item.title || 'Image'}
        className="w-full h-auto block"
        onError={() => setImageError(true)}
        loading="lazy"
      />
      
    </div>
  );
}