'use client'

import { ItemWithMetadata } from '@/types/database';
import XCard from './XCard';
import BookCard from './BookCard';
import StandardCard from './StandardCard';

interface CardRouterProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function CardRouter({ item, onArchive, onDelete, onClick }: CardRouterProps) {
  // Route to specific card components based on content type
  switch (item.content_type) {
    case 'x':
      return (
        <XCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
    case 'book':
      return (
        <BookCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
    // Add more specific card types here as needed
    // case 'youtube':
    //   return <YoutubeCard ... />;
    
    // All other content types use the standard card
    default:
      return (
        <StandardCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
  }
}