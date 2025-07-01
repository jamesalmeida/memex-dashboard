// Database type definitions that match our PostgreSQL schema

export type ContentType = 
  // Social Media
  | 'x' | 'instagram' | 'youtube' | 'linkedin' | 'tiktok' | 'reddit' | 'facebook'
  // Development
  | 'github' | 'gitlab' | 'codepen' | 'stackoverflow' | 'devto' | 'npm' | 'documentation'
  // Content & Media
  | 'article' | 'pdf' | 'image' | 'video' | 'audio' | 'presentation'
  // Commerce
  | 'product' | 'amazon' | 'etsy' | 'app'
  // Knowledge
  | 'wikipedia' | 'paper' | 'book' | 'course'
  // Entertainment  
  | 'movie' | 'tv-show'
  // Personal
  | 'note' | 'bookmark' | 'recipe' | 'location'
  // Fallback
  | 'unknown';

export interface Space {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  sort_order: number;
}

export interface Item {
  id: string;
  user_id: string;
  space_id?: string | null;
  title: string;
  url?: string | null;
  content_type: ContentType;
  content?: string | null;        // Main content (tweet text, article body, note content, etc.)
  description?: string | null;     // Summary or metadata (article excerpt, image filename, etc.)
  thumbnail_url?: string | null;
  raw_text?: string | null;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  is_archived: boolean;
  is_favorite: boolean;
  user_notes?: string | null;
  tldr_summary?: string | null;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color?: string | null;
  created_at: string;
}

export interface ItemTag {
  item_id: string;
  tag_id: string;
  created_at: string;
}

export interface ItemMetadata {
  id: string;
  item_id: string;
  
  // Common fields
  author?: string | null;
  domain?: string | null;
  
  // Media fields
  video_url?: string | null; // Direct URL to video content
  duration?: number | null; // in seconds
  file_size?: number | null; // in bytes
  page_count?: number | null;
  
  // Social media fields
  username?: string | null;
  likes?: number | null;
  replies?: number | null;
  retweets?: number | null;
  views?: number | null;
  
  // Commerce fields
  price?: number | null;
  rating?: number | null;
  reviews?: number | null;
  in_stock?: boolean | null;
  
  // Development fields
  stars?: number | null;
  forks?: number | null;
  language?: string | null;
  
  // Academic fields
  citations?: number | null;
  published_date?: string | null; // ISO date string
  journal?: string | null;
  
  // Additional flexible JSON storage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra_data?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

// Extended types for client-side use
export interface ItemWithMetadata extends Item {
  metadata?: ItemMetadata | null;
  tags?: Tag[];
  space?: Space | null;
}

// Input types for mutations
export interface CreateItemInput {
  title: string;
  url?: string | null;
  content_type: ContentType;
  content?: string | null;
  description?: string | null;
  space_id?: string | null;
  thumbnail_url?: string | null;
  raw_text?: string | null;
}

export interface UpdateItemInput {
  title?: string;
  url?: string | null;
  content_type?: ContentType;
  content?: string | null;
  description?: string | null;
  space_id?: string | null;
  thumbnail_url?: string | null;
  raw_text?: string | null;
  is_archived?: boolean;
  is_favorite?: boolean;
  user_notes?: string | null;
}

export interface CreateSpaceInput {
  name: string;
  color?: string;
  description?: string | null;
  sort_order?: number;
}

export interface UpdateSpaceInput {
  name?: string;
  color?: string;
  description?: string | null;
  sort_order?: number;
  is_archived?: boolean;
}

export interface CreateTagInput {
  name: string;
  color?: string | null;
}

export interface CreateItemMetadataInput {
  item_id: string;
  author?: string | null;
  domain?: string | null;
  video_url?: string | null;
  duration?: number | null;
  file_size?: number | null;
  page_count?: number | null;
  username?: string | null;
  likes?: number | null;
  replies?: number | null;
  retweets?: number | null;
  views?: number | null;
  price?: number | null;
  rating?: number | null;
  reviews?: number | null;
  in_stock?: boolean | null;
  stars?: number | null;
  forks?: number | null;
  language?: string | null;
  citations?: number | null;
  published_date?: string | null;
  journal?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra_data?: Record<string, any>;
}