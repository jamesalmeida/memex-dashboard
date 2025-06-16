'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';
import ContentTypeIcon from './ContentTypeIcon';

interface TikTokCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function TikTokCard({ item, onArchive, onDelete, onClick }: TikTokCardProps) {
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
  console.log('TikTokCard rendering:', {
    id: item.id,
    hasThumb: !!item.thumbnail_url,
    thumbUrl: item.thumbnail_url,
    imageError,
    title: item.title
  });

  // Fallback if no image (most common for TikTok currently)
  if (!item.thumbnail_url || imageError) {
    return (
      <div 
        id={`tiktok-card-fallback-${item.id}`}
        className="bg-gray-100 dark:bg-gray-800 aspect-square flex items-center justify-center cursor-pointer relative shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 transform-gpu rounded-lg border border-gray-200 dark:border-gray-700"
        onClick={handleCardClick}
        onMouseEnter={() => setShowHover(true)}
        onMouseLeave={() => setShowHover(false)}
      >
        <div className="text-gray-400 dark:text-gray-600 text-center">
          <ContentTypeIcon type="tiktok" className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">TikTok Video</p>
          {item.metadata?.username && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              @{item.metadata.username}
            </p>
          )}
        </div>
        
        {/* TikTok gradient top border */}
        <div 
          className="absolute top-0 left-0 right-0 h-[5px] z-10 rounded-t-lg"
          style={{ background: 'linear-gradient(90deg, #FF0050 0%, #FF0050 50%, #00F2EA 100%)' }}
        />

        {/* TikTok icon in top left */}
        <div className="absolute top-3 left-3 z-20">
          <ContentTypeIcon type="tiktok" className="text-white w-[21px] h-[21px]" />
        </div>

        {/* Duration badge if available */}
        {item.metadata?.duration && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white rounded px-2 py-1 text-xs font-medium z-20">
            {item.metadata.duration}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      id={`tiktok-card-${item.id}`}
      className="relative cursor-pointer group overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 transform-gpu aspect-square rounded-lg border border-gray-200 dark:border-gray-700"
      onClick={handleCardClick}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
    >
      {/* TikTok gradient top border */}
      <div 
        className="absolute top-0 left-0 right-0 h-[5px] z-10"
        style={{ background: 'linear-gradient(90deg, #FF0050 0%, #FF0050 50%, #00F2EA 100%)' }}
      />
      
      {/* TikTok image - full width, cropped to vertical aspect ratio */}
      <img
        src={item.thumbnail_url}
        alt={item.title || 'TikTok video'}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.log('TikTok image failed to load:', {
            url: item.thumbnail_url,
            error: e
          });
          setImageError(true);
        }}
        onLoad={() => {
          console.log('TikTok image loaded successfully:', item.thumbnail_url);
        }}
        loading="lazy"
      />
      
      {/* TikTok icon in top left */}
      <div className="absolute top-3 left-3 z-20">
        <ContentTypeIcon type="tiktok" className="text-white w-[21px] h-[21px]" />
      </div>

      {/* Duration badge if available */}
      {item.metadata?.duration && (
        <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white rounded px-2 py-1 text-xs font-medium z-20">
          {item.metadata.duration}
        </div>
      )}

      {/* TikTok label on hover - bottom right */}
      <div className={`absolute bottom-3 right-3 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 flex items-center gap-2 transition-opacity duration-200 ${showHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <ContentTypeIcon type="tiktok" className="w-4 h-4" />
        <span className="text-sm font-medium">TikTok</span>
      </div>

      {/* Username overlay - bottom left */}
      {item.metadata?.username && (
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 text-white rounded px-2 py-1 text-xs font-medium z-20">
          @{item.metadata.username}
        </div>
      )}
    </div>
  );
}