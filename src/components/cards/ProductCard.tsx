'use client'

import { ItemWithMetadata } from '@/types/database';
import BaseCard from './BaseCard';

interface ProductCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function ProductCard({ item, onArchive, onDelete, onClick }: ProductCardProps) {
  return (
    <div className="flex flex-col hover:scale-[1.02] transition-all duration-200 transform-gpu">
      <BaseCard 
        item={item} 
        onArchive={onArchive} 
        onDelete={onDelete} 
        onClick={onClick}
        className="product-card"
        showImage={false}
        hideContentLabel={true}
      >
        {/* Square thumbnail with full coverage */}
        {item.thumbnail_url && (
          <div className="relative aspect-square -m-3 md:-m-4 overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={item.thumbnail_url}
              alt={item.title || 'Product'}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Floating price in top right */}
            {item.metadata?.price && (
              <div 
                className="absolute top-3 right-3 bg-gray-100 dark:bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm"
                style={{ color: 'rgb(55, 65, 81)' }}
              >
                <span className="text-sm font-bold text-gray-700 dark:text-gray-100">
                  {typeof item.metadata.price === 'string' && item.metadata.price.includes('$') 
                    ? item.metadata.price 
                    : `$${item.metadata.price}`}
                </span>
              </div>
            )}
            {/* Rating badge if available */}
            {item.metadata?.rating && (
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-md flex items-center gap-1">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-xs font-medium">{item.metadata.rating}</span>
                {item.metadata?.reviews && (
                  <span className="text-xs text-gray-300">({item.metadata.reviews.toLocaleString()})</span>
                )}
              </div>
            )}
          </div>
        )}
      </BaseCard>
      {/* Title below the card like YouTube */}
        {item.title && (
          <h3 className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 text-center">
            {item.title}
          </h3>
        )}
        {item.metadata?.author && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {item.metadata.author}
          </p>
        )}
    </div>
  );
}