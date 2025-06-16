'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';
import ContentTypeIcon from './ContentTypeIcon';

interface BaseCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
  children: React.ReactNode;
  showImage?: boolean;
  className?: string;
  hideContentLabel?: boolean;
}

export default function BaseCard({ 
  item, 
  onArchive, 
  onDelete, 
  onClick, 
  children,
  showImage = true,
  className = '',
  hideContentLabel = false
}: BaseCardProps) {
  const [showHover, setShowHover] = useState(false);
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

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'x': 'X',
      'youtube': 'YouTube',
      'github': 'GitHub',
      'amazon': 'Amazon',
      'article': 'Article',
      'link': 'Link',
      'text': 'Note',
      'pdf': 'PDF',
      'video': 'Video',
      'audio': 'Podcast'
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div 
      id={`base-card-${item.id}`}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 transform-gpu cursor-pointer overflow-hidden flex flex-col ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
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
        </div>
      ) : null}
      
      {/* Content Area - provided by individual card components */}
      <div 
        className={`p-3 md:p-4 flex-1 flex flex-col ${(item.content_type === 'instagram' || item.content_type === 'tiktok') ? 'relative' : ''}`}
        style={item.content_type === 'x' ? { borderTop: '5px solid #1E9BF0' } : undefined}
      >
        {/* Instagram gradient top border */}
        {item.content_type === 'instagram' && (
          <div 
            className="absolute top-0 left-0 right-0 h-[5px]"
            style={{ background: 'linear-gradient(90deg, #FF6930 35%, #F80261 55%)' }}
          />
        )}
        {/* TikTok gradient top border */}
        {item.content_type === 'tiktok' && (
          <div 
            className="absolute top-0 left-0 right-0 h-[5px]"
            style={{ background: 'linear-gradient(90deg, #00F2EA, #FF0050)' }}
          />
        )}
        {children}

        {/* Footer Section - Space */}
        <div className="mt-auto">

          <div className="flex items-center justify-end text-xs text-gray-500 dark:text-gray-400 min-w-0">
            {item.space && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded truncate max-w-20">
                {item.space.name}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Content type label overlay on hover - bottom right */}
      {!hideContentLabel && (
        <div className={`absolute bottom-3 right-3 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 flex items-center gap-2 transition-opacity duration-200 ${showHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ContentTypeIcon type={item.content_type} className="w-4 h-4" />
          <span className="text-sm font-medium">{getContentTypeLabel(item.content_type)}</span>
        </div>
      )}
    </div>
  );
}