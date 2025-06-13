'use client'

import { MockSpace } from '@/utils/mockData';

interface SpaceCardProps {
  space: MockSpace;
  onClick: (space: MockSpace) => void;
}

export default function SpaceCard({ space, onClick }: SpaceCardProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all cursor-pointer h-48 flex flex-col p-6"
      onClick={() => onClick(space)}
    >
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
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">
          {space.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {space.count} {space.count === 1 ? 'item' : 'items'}
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
}