'use client'

import { useState, useEffect, memo } from 'react';
import { ItemWithMetadata } from '@/types/database';
import { CardRouter } from './cards';

interface ItemCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveToProject?: (id: string, spaceId: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
  isProcessing?: boolean;
}

const ItemCard = memo(function ItemCard({ 
  item, 
  onArchive, 
  onDelete, 
  onMoveToProject, 
  onClick,
  isProcessing = false
}: ItemCardProps) {
  const [showOverlay, setShowOverlay] = useState(isProcessing);
  
  useEffect(() => {
    if (isProcessing) {
      setShowOverlay(true);
    } else {
      // Delay hiding to allow fade out animation
      const timer = setTimeout(() => setShowOverlay(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isProcessing]);
  
  return (
    <div className="relative">
      <CardRouter 
        item={item}
        onArchive={onArchive}
        onDelete={onDelete}
        onClick={onClick}
      />
      
      {/* Processing overlay */}
      {showOverlay && (
        <div 
          className={`absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg transition-opacity duration-500 ${
            isProcessing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Processing...</p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.description === nextProps.item.description &&
    prevProps.item.thumbnail_url === nextProps.item.thumbnail_url &&
    prevProps.item.is_favorite === nextProps.item.is_favorite &&
    prevProps.item.updated_at === nextProps.item.updated_at &&
    prevProps.isProcessing === nextProps.isProcessing
  );
});

export default ItemCard;