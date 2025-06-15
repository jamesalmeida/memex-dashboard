'use client'

import { ItemWithMetadata } from '@/types/database';
import XCard from './XCard';
import BookCard from './BookCard';
import ImageCard from './ImageCard';
import YoutubeCard from './YoutubeCard';
import PodcastCard from './PodcastCard';
import GithubCard from './GithubCard';
import StandardCard from './StandardCard';

interface CardRouterProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function CardRouter({ item, onArchive, onDelete, onClick }: CardRouterProps) {
  // Debug logging to help identify routing issues
  console.log(`CardRouter: Routing item ${item.id} with content_type: "${item.content_type}"`);
  
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
    
    case 'image':
      return (
        <ImageCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
    case 'youtube':
      return (
        <YoutubeCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
    case 'audio':
      return (
        <PodcastCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
    case 'github':
      return (
        <GithubCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
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