'use client'

import { ItemWithMetadata } from '@/types/database';
import BaseCard from './BaseCard';
import ContentTypeIcon from './ContentTypeIcon';
import VideoPlayer from '../VideoPlayer';

interface XCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function XCard({ item, onArchive, onDelete, onClick }: XCardProps) {
  const truncateText = (text: string, maxLength: number = 250) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col">
    <BaseCard 
      item={item} 
      onArchive={onArchive} 
      onDelete={onDelete} 
      onClick={onClick}
      showImage={false} // Don't show image at top
      className="x-card"
    >
      {/* Header with X icon only */}
      <div id={`x-card-header-${item.id}`} className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm min-w-0 flex-1">
          <ContentTypeIcon type="x" />
        </div>
        <div className="flex items-center gap-2">
          {/* Social media engagement for X/Twitter */}
          {item.metadata?.likes && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {item.metadata.likes.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Display name and username */}
      <h3 id={`x-card-author-${item.id}`} className="font-medium text-gray-900 dark:text-gray-100 mb-2 min-w-0 break-words">
        {item.metadata?.extra_data?.display_name || item.metadata?.username || 'Unknown User'} (@{item.metadata?.username || 'unknown'})
      </h3>
      
      {/* Tweet content - expanded text with 250 char limit */}
      <p id={`x-card-content-${item.id}`} className="text-sm text-gray-600 dark:text-gray-300 mb-3 min-w-0 break-words whitespace-pre-wrap">
        {truncateText(item.content || '', 250)}
      </p>

      {/* Media at bottom - Video or Image */}
      {item.thumbnail_url && (
        <div id={`x-card-media-${item.id}`} className="mt-auto mb-2 relative">
          {/* Check if this is a video tweet with actual video URL */}
          {item.metadata?.video_url ? (
            /* Play video directly */
            <div className="relative rounded-lg overflow-hidden">
              <VideoPlayer
                videoUrl={item.metadata.video_url}
                thumbnailUrl={item.thumbnail_url}
                autoplay={true}
                muted={true}
                loop={true}
                className="w-full h-auto"
              />
              {/* Video indicator badge */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none">
                Video
              </div>
            </div>
          ) : (item.metadata?.extra_data?.video_type || 
                item.metadata?.extra_data?.is_video ||
                item.metadata?.extra_data?.twitter_player_url ||
                item.content?.toLowerCase().includes('video') ||
                item.url?.includes('/video/')) ? (
            /* Video without URL - show thumbnail with play button */
            <div className="relative rounded-lg overflow-hidden cursor-pointer" 
                 style={{ border: '1px solid lightgray' }}
                 onClick={() => window.open(item.url, '_blank')}>
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-auto"
                loading="lazy"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all">
                <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              {/* Video indicator badge */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                Video
              </div>
            </div>
          ) : (
            /* Regular image */
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          )}
        </div>
      )}
    </BaseCard>
    {item.title && (
      <h3 className="mt-1 text-sm font-normal text-gray-900 dark:text-gray-100 text-center truncate">
        {item.title}
      </h3>
    )}
  </div>
  );
}