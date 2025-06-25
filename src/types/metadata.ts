import { ContentType, ContentCategory } from '@/lib/contentTypes/patterns';

/**
 * Base metadata interface that all content types extend
 */
export interface BaseMetadata {
  // Required fields
  url: string;
  title: string;
  contentType: ContentType;
  category: ContentCategory;
  extractedAt: string;
  
  // Common optional fields
  description?: string;
  thumbnail?: string;
  favicon?: string;
  siteName?: string;
  publishedAt?: string;
  duration?: string; // For videos/audio
  fileSize?: number;
  mimeType?: string;
  
  // Author information
  author?: {
    name: string;
    username?: string;
    profileUrl?: string;
    profileImage?: string;
    verified?: boolean;
  };
  
  // Engagement metrics
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
    plays?: number;
    saves?: number;
    retweets?: number;
    quotes?: number;
  };
  
  // Media information
  media?: {
    images?: MediaItem[];
    videos?: MediaItem[];
    audio?: MediaItem[];
  };
  
  // Additional metadata
  tags?: string[];
  keywords?: string[];
  language?: string;
  isNsfw?: boolean;
  isPremium?: boolean;
}

export interface MediaItem {
  url: string;
  width?: number;
  height?: number;
  duration?: string;
  thumbnail?: string;
  format?: string;
  size?: number;
}

/**
 * Social media specific metadata
 */
export interface SocialMediaMetadata extends BaseMetadata {
  postId?: string;
  postType?: 'text' | 'image' | 'video' | 'reel' | 'story' | 'thread';
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
  isSponsored?: boolean;
  threadItems?: Array<{
    id: string;
    text: string;
    media?: MediaItem[];
    createdAt?: string;
  }>;
}

/**
 * Platform-specific metadata interfaces
 */
export interface TwitterMetadata extends SocialMediaMetadata {
  contentType: 'twitter';
  tweetId: string;
  conversationId?: string;
  isRetweet?: boolean;
  isQuote?: boolean;
  quotedTweet?: Partial<TwitterMetadata>;
  spaces?: {
    id: string;
    title: string;
    state: string;
  };
}

export interface InstagramMetadata extends SocialMediaMetadata {
  contentType: 'instagram';
  postId: string;
  postType: 'post' | 'reel' | 'story' | 'igtv';
  carousel?: MediaItem[];
}

export interface YouTubeMetadata extends BaseMetadata {
  contentType: 'youtube';
  videoId: string;
  channelId: string;
  channelName: string;
  channelUrl: string;
  channelImage?: string;
  duration: string;
  isLive?: boolean;
  isShort?: boolean;
  isPremiere?: boolean;
  chapters?: Array<{
    title: string;
    startTime: number;
  }>;
  transcript?: {
    available: boolean;
    languages?: string[];
  };
  category?: string;
  isAgeRestricted?: boolean;
}

export interface RedditMetadata extends SocialMediaMetadata {
  contentType: 'reddit';
  postId: string;
  subreddit: string;
  subredditIcon?: string;
  postType: 'text' | 'link' | 'image' | 'video' | 'gallery';
  score: number;
  upvoteRatio?: number;
  awards?: Array<{
    name: string;
    icon: string;
    count: number;
  }>;
  crosspostParent?: string;
  isStickied?: boolean;
  isLocked?: boolean;
  isNsfw?: boolean;
}

export interface TikTokMetadata extends SocialMediaMetadata {
  contentType: 'tiktok';
  videoId: string;
  musicTitle?: string;
  musicAuthor?: string;
  musicUrl?: string;
  challenges?: string[];
  effects?: string[];
}

/**
 * E-commerce metadata
 */
export interface ProductMetadata extends BaseMetadata {
  category: 'ecommerce';
  productId?: string;
  brand?: string;
  price?: {
    current: number;
    original?: number;
    currency: string;
    discount?: number;
  };
  availability?: 'in_stock' | 'out_of_stock' | 'limited' | 'pre_order';
  rating?: {
    average: number;
    count: number;
  };
  specifications?: Record<string, string>;
  variants?: Array<{
    name: string;
    options: string[];
  }>;
  seller?: {
    name: string;
    rating?: number;
    url?: string;
  };
}

export interface AmazonMetadata extends ProductMetadata {
  contentType: 'amazon';
  asin: string;
  isPrime?: boolean;
  department?: string;
}

/**
 * Article metadata
 */
export interface ArticleMetadata extends BaseMetadata {
  category: 'article';
  wordCount?: number;
  readingTime?: number; // in minutes
  excerpt?: string;
  sections?: Array<{
    title: string;
    level: number;
  }>;
  publication?: {
    name: string;
    logo?: string;
    url?: string;
  };
}

export interface MediumMetadata extends ArticleMetadata {
  contentType: 'medium';
  claps?: number;
  responses?: number;
  readingList?: string;
  topics?: string[];
}

/**
 * Code repository metadata
 */
export interface CodeMetadata extends BaseMetadata {
  category: 'code';
  repoName: string;
  owner: string;
  branch?: string;
  path?: string;
  language?: string;
  languages?: Record<string, number>; // language -> percentage
  stars?: number;
  forks?: number;
  watchers?: number;
  issues?: number;
  pullRequests?: number;
  lastCommit?: {
    sha: string;
    message: string;
    author: string;
    date: string;
  };
  topics?: string[];
  license?: string;
  isPrivate?: boolean;
  isFork?: boolean;
  isArchived?: boolean;
}

export interface GitHubMetadata extends CodeMetadata {
  contentType: 'github';
  defaultBranch: string;
  homepage?: string;
  size?: number; // in KB
}

/**
 * Media metadata
 */
export interface MovieMetadata extends BaseMetadata {
  contentType: 'imdb' | 'netflix';
  movieId: string;
  year?: number;
  runtime?: string;
  genre?: string[];
  director?: string[];
  cast?: string[];
  rating?: {
    value: number;
    votes: number;
    source: string;
  };
  plot?: string;
  poster?: string;
  trailer?: string;
}

export interface MusicMetadata extends BaseMetadata {
  contentType: 'spotify' | 'soundcloud';
  trackId?: string;
  artist: string;
  album?: string;
  albumArt?: string;
  duration: string;
  genre?: string[];
  releaseDate?: string;
  explicit?: boolean;
  preview?: string;
  isPlayable?: boolean;
}

/**
 * Type guards
 */
export function isSocialMediaMetadata(metadata: BaseMetadata): metadata is SocialMediaMetadata {
  return metadata.category === 'social';
}

export function isProductMetadata(metadata: BaseMetadata): metadata is ProductMetadata {
  return metadata.category === 'ecommerce';
}

export function isArticleMetadata(metadata: BaseMetadata): metadata is ArticleMetadata {
  return metadata.category === 'article';
}

export function isCodeMetadata(metadata: BaseMetadata): metadata is CodeMetadata {
  return metadata.category === 'code';
}

/**
 * Union type for all metadata types
 */
export type ContentMetadata = 
  | TwitterMetadata
  | InstagramMetadata
  | YouTubeMetadata
  | RedditMetadata
  | TikTokMetadata
  | AmazonMetadata
  | MediumMetadata
  | GitHubMetadata
  | MovieMetadata
  | MusicMetadata
  | ProductMetadata
  | ArticleMetadata
  | CodeMetadata
  | BaseMetadata;