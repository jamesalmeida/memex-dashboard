'use client'

import { MockItem } from '@/utils/mockData';
import { useState } from 'react';

interface ItemCardProps {
  item: MockItem;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveToProject?: (id: string, spaceId: string) => void;
  onClick?: (item: MockItem) => void;
}

const ContentTypeIcon = ({ type }: { type: MockItem['content_type'] }) => {
  const iconClass = "w-4 h-4 flex-shrink-0";
  
  switch (type) {
    case 'link':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case 'video':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'image':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'pdf':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'text':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'tweet':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
};

export default function ItemCard({ item, onArchive, onDelete, onMoveToProject, onClick }: ItemCardProps) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getCardHeight = () => {
    if (item.content_type === 'image') return 'h-80';
    if (item.content_type === 'video') return 'h-64';
    if (item.content_type === 'text') return 'h-32';
    return 'h-48';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.(item);
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all ${getCardHeight()} flex flex-col cursor-pointer max-w-full`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleCardClick}
    >
      {item.thumbnail && (
        <div className="relative overflow-hidden bg-gray-100 flex-shrink-0" style={{ height: '120px' }}>
          <img 
            src={item.thumbnail} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {showActions && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button 
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
                onClick={() => onArchive?.(item.id)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 0V6a2 2 0 012-2h2a2 2 0 012 2v2l4 0m-6 12V10m0 0l1-1m-1 1l-1-1" />
                </svg>
              </button>
              <button 
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
                onClick={() => onDelete?.(item.id)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm min-w-0 flex-1">
            <ContentTypeIcon type={item.content_type} />
            <span className="capitalize">{item.content_type}</span>
            {item.metadata?.domain && (
              <>
                <span>•</span>
                <span className="truncate min-w-0">{item.metadata.domain}</span>
              </>
            )}
          </div>
          {item.metadata?.duration && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {item.metadata.duration}
            </span>
          )}
        </div>

        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 flex-1 min-w-0 break-words">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 min-w-0 break-words">
            {item.description}
          </p>
        )}

        <div className="mt-auto">
          {item.metadata?.tags && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.metadata.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 min-w-0">
            <span className="truncate">{formatDate(item.created_at)}</span>
            {item.space && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded truncate max-w-20 ml-1">
                {item.space}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}