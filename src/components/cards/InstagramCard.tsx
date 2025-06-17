'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';
import ContentTypeIcon from './ContentTypeIcon';

interface InstagramCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function InstagramCard({ item, onArchive, onDelete, onClick }: InstagramCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showHover, setShowHover] = useState(false);

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
      <div className="flex flex-col hover:scale-[1.02] transition-all duration-200 transform-gpu">
        <div 
          id={`instagram-card-fallback-${item.id}`}
          className="bg-gray-100 dark:bg-gray-800 aspect-square flex items-center justify-center cursor-pointer relative shadow-sm hover:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
          onClick={handleCardClick}
          onMouseEnter={() => setShowHover(true)}
          onMouseLeave={() => setShowHover(false)}
        >
          <div className="text-gray-400 dark:text-gray-600 text-center">
            <ContentTypeIcon type="instagram" className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Instagram Post</p>
          </div>
          
          {/* Instagram icon in top left */}
          <div className="absolute top-3 left-3 z-20">
            <ContentTypeIcon type="instagram" className="text-white w-[21px] h-[21px]" />
          </div>
        </div>
        {item.title && (
          <h3 className="mt-1 text-sm font-normal text-gray-900 dark:text-gray-100 text-center truncate">
            {item.title}
          </h3>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col hover:scale-[1.02] transition-all duration-200 transform-gpu">
      <div 
        id={`instagram-card-${item.id}`}
        className="relative cursor-pointer group overflow-hidden shadow-sm hover:shadow-lg aspect-square rounded-lg border border-gray-200 dark:border-gray-700"
        onClick={handleCardClick}
        onMouseEnter={() => setShowHover(true)}
        onMouseLeave={() => setShowHover(false)}
      >
        {/* Instagram gradient top border */}
        <div 
          className="absolute top-0 left-0 right-0 h-[5px] z-10"
          style={{ background: 'linear-gradient(90deg, #FF6930 35%, #F80261 55%)' }}
        />
        
        {/* Instagram image - full width, cropped to square */}
        <img
          src={item.thumbnail_url}
          alt={item.title || 'Instagram post'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Instagram icon in top left */}
        <div className="absolute top-3 left-3 z-20">
          <ContentTypeIcon type="instagram" className="text-white w-[21px] h-[21px]" />
        </div>

        {/* Instagram label on hover - bottom right */}
        <div className={`absolute bottom-3 right-3 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 flex items-center gap-2 transition-opacity duration-200 ${showHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ContentTypeIcon type="instagram" className="w-4 h-4" />
          <span className="text-sm font-medium">Instagram</span>
        </div>
      </div>
      {item.title && (
        <h3 className="mt-1 text-sm font-normal text-gray-900 dark:text-gray-100 text-center truncate">
          {item.title}
        </h3>
      )}
    </div>
  );
}