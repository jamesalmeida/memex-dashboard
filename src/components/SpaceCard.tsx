'use client'

import { memo } from 'react';
import type { Space } from '@/types/database';

interface SpaceCardProps {
  space: Space & { item_count: number };
  onClick: (space: Space & { item_count: number }) => void;
  onEdit?: (space: Space & { item_count: number }) => void;
  onDelete?: (space: Space & { item_count: number }) => void;
}

const SpaceCard = memo(function SpaceCard({ space, onClick, onEdit, onDelete }: SpaceCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(space);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(space);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col p-6 relative group"
      onClick={() => onClick(space)}
    >
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className="p-1.5 bg-white dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm"
          title="Edit space"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 bg-white dark:bg-gray-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm"
          title="Delete space"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0" 
          style={{ backgroundColor: space.color }}
        ></div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
          {space.name}
        </h3>
      </div>

      {space.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {space.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {space.item_count} {space.item_count === 1 ? 'item' : 'items'}
        </span>
        <svg 
          className="w-5 h-5 text-gray-400 dark:text-gray-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </div>
    </div>
  );
});

export default SpaceCard;