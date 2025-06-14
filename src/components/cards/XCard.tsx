'use client'

import { ItemWithMetadata } from '@/types/database';
import BaseCard from './BaseCard';
import ContentTypeIcon from './ContentTypeIcon';

interface XCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function XCard({ item, onArchive, onDelete, onClick }: XCardProps) {
  return (
    <BaseCard 
      item={item} 
      onArchive={onArchive} 
      onDelete={onDelete} 
      onClick={onClick}
    >
      {/* Header with X icon only */}
      <div className="flex items-start justify-between mb-2">
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
      <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 flex-1 min-w-0 break-words">
        {item.metadata?.display_name || item.metadata?.username || 'Unknown User'} (@{item.metadata?.username || 'unknown'})
      </h3>
      
      {/* Tweet content */}
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 min-w-0 break-words">
        {item.title}
      </p>
    </BaseCard>
  );
}