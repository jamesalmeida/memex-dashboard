'use client'

import { useState } from 'react';
import { ItemWithMetadata } from '@/types/database';
import ContentTypeIcon from './ContentTypeIcon';

interface YoutubeCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function YoutubeCard({ item, onArchive, onDelete, onClick }: YoutubeCardProps) {
  const [showHover, setShowHover] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    onClick?.(item);
  };

  // Check if this is a YouTube Short (vertical video)
  const isYouTubeShort = item.url?.includes('/shorts/') || false;

  // Fallback thumbnail if none provided
  const thumbnailUrl = item.thumbnail_url || `https://img.youtube.com/vi/${item.metadata?.video_id || 'default'}/hqdefault.jpg`;

  return (
    <div 
      className="flex flex-col hover:scale-[1.02] transition-all duration-200 transform-gpu"
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
    >
      <div 
        id={`youtube-card-${item.id}`}
        className={`relative rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer overflow-hidden ${isYouTubeShort ? 'aspect-square' : 'aspect-video'}`}
        onClick={handleCardClick}
      >
        {/* Thumbnail fills entire card */}
        <img
          src={thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* YouTube play button or Shorts logo overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isYouTubeShort ? (
            // YouTube Shorts logo
            <div className="relative">
              <img 
                src="/icon_youtube_shorts.svg"
                alt="YouTube Shorts"
                className="w-16 h-16 drop-shadow-lg"
              />
            </div>
          ) : (
            // Regular YouTube play button
            <div className="relative drop-shadow-lg" style={{ color: '#FF0000' }}>
              {/* White background to fill transparent triangle - always white in all modes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8" style={{ backgroundColor: '#FFFFFF' }}></div>
              </div>
              <ContentTypeIcon type="youtube" className="w-16 h-16 relative z-10" />
            </div>
          )}
        </div>

        {/* Duration badge if available */}
        {item.metadata?.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {item.metadata.duration}
          </div>
        )}

        {/* YouTube label on hover - bottom right */}
        <div className={`absolute bottom-3 right-3 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 flex items-center gap-2 transition-opacity duration-200 ${showHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ContentTypeIcon type="youtube" className="w-4 h-4" />
          <span className="text-sm font-medium">{isYouTubeShort ? 'YouTube Short' : 'YouTube'}</span>
        </div>
      </div>
      
      {/* Title below the card */}
      <h3 id={`youtube-card-title-${item.id}`} className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 text-left truncate">
        {item.title}
      </h3>
    </div>
  );
}