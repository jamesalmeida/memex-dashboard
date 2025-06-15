'use client'

import { ItemWithMetadata } from '@/types/database';
import BaseCard from './BaseCard';
import ContentTypeIcon from './ContentTypeIcon';

interface GithubCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function GithubCard({ item, onArchive, onDelete, onClick }: GithubCardProps) {
  return (
    <BaseCard 
      item={item} 
      onArchive={onArchive} 
      onDelete={onDelete} 
      onClick={onClick}
      className="github-card"
    >
      {/* Header with GitHub icon and name */}
      <div id={`github-card-header-${item.id}`} className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm min-w-0 flex-1">
          <ContentTypeIcon type="github" />
          <span className="font-mono">GitHub</span>
        </div>
      </div>

      {/* Title in monospace */}
      <h3 id={`github-card-title-${item.id}`} className="font-mono font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 flex-1 min-w-0 break-words">
        {item.title}
      </h3>
      
      {/* Description in monospace if present */}
      {item.description && (
        <p id={`github-card-description-${item.id}`} className="font-mono text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-2 min-w-0 break-words">
          {item.description}
        </p>
      )}

      {/* Author/repo info in monospace */}
      {item.metadata?.author && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
          <span className="font-mono">{item.metadata.author}</span>
        </div>
      )}
    </BaseCard>
  );
}