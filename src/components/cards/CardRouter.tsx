'use client'

import { ItemWithMetadata } from '@/types/database';
import XCard from './XCard';
import BookCard from './BookCard';
import ImageCard from './ImageCard';
import YoutubeCard from './YoutubeCard';
import PodcastCard from './PodcastCard';
import GithubCard from './GithubCard';
import InstagramCard from './InstagramCard';
import TikTokCard from './TikTokCard';
import MovieCard from './MovieCard';
import ProductCard from './ProductCard';
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
    
    case 'instagram':
      return (
        <InstagramCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
    case 'tiktok':
      return (
        <TikTokCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
    case 'movie':
    case 'tv-show':
      return (
        <MovieCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
    case 'product':
    case 'amazon':
    case 'etsy':
      return (
        <ProductCard 
          item={item}
          onArchive={onArchive}
          onDelete={onDelete}
          onClick={onClick}
        />
      );
    
    case 'video':
      // Check if it's an IMDB movie/TV show
      if (item.url?.includes('imdb.com/title/') || item.metadata?.imdb_id) {
        return (
          <MovieCard 
            item={item}
            onArchive={onArchive}
            onDelete={onDelete}
            onClick={onClick}
          />
        );
      }
      // Otherwise use standard card for regular videos
      return (
        <StandardCard 
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