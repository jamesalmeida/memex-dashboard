'use client'

import { ItemWithMetadata } from '@/types/database';
import { ContentType } from '@/types/database';
import BaseCard from './BaseCard';
import ContentTypeIcon from './ContentTypeIcon';

interface StandardCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function StandardCard({ item, onArchive, onDelete, onClick }: StandardCardProps) {
  const getContentTypeName = (type: ContentType): string => {
    switch (type) {
      case 'youtube': return 'YouTube';
      case 'amazon': return 'Amazon';
      case 'github': return 'GitHub';
      case 'stackoverflow': return 'Stack Overflow';
      case 'linkedin': return 'LinkedIn';
      case 'tiktok': return 'TikTok';
      case 'instagram': return 'Instagram';
      case 'facebook': return 'Facebook';
      case 'reddit': return 'Reddit';
      case 'wikipedia': return 'Wikipedia';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <BaseCard 
      item={item} 
      onArchive={onArchive} 
      onDelete={onDelete} 
      onClick={onClick}
      className="standard-card"
      showImage={false}  // Disable BaseCard's image since we handle it here
    >
      {/* Thumbnail image for bookmarks and other content with og:image */}
      {item.thumbnail_url && item.content_type !== 'note' && (
        <div className="relative aspect-video mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={item.thumbnail_url}
            alt={item.title || 'Preview'}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Hide image on error
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Header with icon and content type name */}
      <div id={`standard-card-header-${item.id}`} className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm min-w-0 flex-1">
          <ContentTypeIcon type={item.content_type} />
          <span>{getContentTypeName(item.content_type)}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Duration for media content */}
          {item.metadata?.duration && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {item.metadata.duration}
            </span>
          )}
          {/* GitHub stars */}
          {item.content_type === 'github' && item.metadata?.stars && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {item.metadata.stars.toLocaleString()}
            </span>
          )}
          {/* Product price */}
          {(['product', 'amazon', 'etsy'] as const).includes(item.content_type) && item.metadata?.price && (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded font-medium">
              {item.metadata.price}
            </span>
          )}
        </div>
      </div>

      {/* Title - Always show as H3 for all content types */}
      {item.title && (
        <h3 id={`standard-card-title-${item.id}`} className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 flex-1 min-w-0 break-words">
          {item.title}
        </h3>
      )}

      {/* Content/Description - For notes show content, for others show description */}
      {item.content_type === 'note' && item.content && (
        <p id={`standard-card-content-${item.id}`} className="text-xs md:text-sm text-gray-700 dark:text-gray-300 line-clamp-6 mb-3 min-w-0 break-words">
          {item.content}
        </p>
      )}
      
      {item.content_type !== 'note' && item.description && (
        <p id={`standard-card-description-${item.id}`} className="text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 min-w-0 break-words">
          {item.description}
        </p>
      )}

      {/* Author and additional metadata */}
      {item.metadata?.author && (
        <div id={`standard-card-author-${item.id}`} className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
          <span>by</span>
          <span className="font-medium">{item.metadata.author}</span>
          {(['product', 'amazon', 'etsy'] as const).includes(item.content_type) && item.metadata?.rating && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span>{item.metadata.rating}</span>
                {item.metadata?.reviews && (
                  <span className="text-gray-400">({item.metadata.reviews.toLocaleString()})</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </BaseCard>
  );
}