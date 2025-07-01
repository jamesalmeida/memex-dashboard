import { 
  URL_PATTERNS, 
  FILE_EXTENSION_PATTERNS, 
  ContentType, 
  ContentCategory,
  CONTENT_TYPE_CATEGORIES,
  CONTENT_TYPE_METADATA
} from './patterns';

export interface DetectionResult {
  type: ContentType;
  category: ContentCategory;
  confidence: number;
  metadata: {
    displayName: string;
    icon: string;
    requiresAuth?: boolean;
    hasTranscript?: boolean;
    hasComments?: boolean;
  };
}

/**
 * Detects content type from a URL
 */
export function detectContentType(url: string): DetectionResult {
  try {
    const normalizedUrl = url.toLowerCase().trim();
    
    // Check specific platform patterns first
    for (const [platform, patterns] of Object.entries(URL_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedUrl)) {
          const type = platform as ContentType;
          return {
            type,
            category: CONTENT_TYPE_CATEGORIES[type],
            confidence: 1.0,
            metadata: CONTENT_TYPE_METADATA[type],
          };
        }
      }
    }
    
    // Check file extensions for generic types
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    
    if (FILE_EXTENSION_PATTERNS.image.test(pathname)) {
      return {
        type: 'image',
        category: 'image',
        confidence: 0.9,
        metadata: CONTENT_TYPE_METADATA.image,
      };
    }
    
    if (FILE_EXTENSION_PATTERNS.video.test(pathname)) {
      return {
        type: 'video',
        category: 'media',
        confidence: 0.9,
        metadata: CONTENT_TYPE_METADATA.video,
      };
    }
    
    if (FILE_EXTENSION_PATTERNS.audio.test(pathname)) {
      return {
        type: 'audio',
        category: 'media',
        confidence: 0.9,
        metadata: CONTENT_TYPE_METADATA.audio,
      };
    }
    
    if (FILE_EXTENSION_PATTERNS.document.test(pathname)) {
      return {
        type: 'document',
        category: 'document',
        confidence: 0.9,
        metadata: CONTENT_TYPE_METADATA.document,
      };
    }
    
    // Default to article for web pages
    if (urlObj.protocol.startsWith('http')) {
      return {
        type: 'article',
        category: 'article',
        confidence: 0.5,
        metadata: CONTENT_TYPE_METADATA.article,
      };
    }
    
    // Unknown type
    return {
      type: 'unknown',
      category: 'unknown',
      confidence: 0.1,
      metadata: CONTENT_TYPE_METADATA.unknown,
    };
  } catch (error) {
    // Invalid URL
    return {
      type: 'unknown',
      category: 'unknown',
      confidence: 0,
      metadata: CONTENT_TYPE_METADATA.unknown,
    };
  }
}

/**
 * Extract platform-specific IDs from URLs
 */
export function extractPlatformId(url: string, type: ContentType): string | null {
  try {
    const urlObj = new URL(url);
    
    switch (type) {
      case 'twitter': {
        const match = url.match(/status\/(\d+)/);
        return match ? match[1] : null;
      }
      
      case 'youtube': {
        const videoIdMatch = url.match(/(?:v=|\/shorts\/|\/embed\/|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (videoIdMatch) return videoIdMatch[1];
        
        const channelMatch = url.match(/\/@([\w-]+)/);
        if (channelMatch) return channelMatch[1];
        
        return null;
      }
      
      case 'instagram': {
        const match = url.match(/\/(p|reel|tv)\/([\w-]+)/);
        return match ? match[2] : null;
      }
      
      case 'tiktok': {
        const match = url.match(/video\/(\d+)/);
        return match ? match[1] : null;
      }
      
      case 'reddit': {
        const match = url.match(/comments\/(\w+)/);
        return match ? match[1] : null;
      }
      
      case 'github': {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          return `${pathParts[0]}/${pathParts[1]}`;
        }
        return null;
      }
      
      case 'amazon': {
        const match = url.match(/\/dp\/([A-Z0-9]+)/i);
        return match ? match[1] : null;
      }
      
      case 'spotify': {
        const match = url.match(/\/(track|album|playlist|artist)\/([\w-]+)/);
        return match ? `${match[1]}/${match[2]}` : null;
      }
      
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Check if a content type requires authentication
 */
export function requiresAuth(type: ContentType): boolean {
  return CONTENT_TYPE_METADATA[type]?.requiresAuth || false;
}

/**
 * Check if a content type supports transcripts
 */
export function supportsTranscript(type: ContentType): boolean {
  return CONTENT_TYPE_METADATA[type]?.hasTranscript || false;
}

/**
 * Check if a content type has comments
 */
export function hasComments(type: ContentType): boolean {
  return CONTENT_TYPE_METADATA[type]?.hasComments || false;
}

/**
 * Get all content types for a category
 */
export function getContentTypesByCategory(category: ContentCategory): ContentType[] {
  return Object.entries(CONTENT_TYPE_CATEGORIES)
    .filter(([_, cat]) => cat === category)
    .map(([type]) => type as ContentType);
}

/**
 * Normalize URLs for consistent detection
 */
export function normalizeUrl(url: string): string {
  try {
    // Handle Twitter/X domain variations
    url = url.replace(/^https?:\/\/(www\.)?twitter\.com/, 'https://x.com');
    
    // Remove tracking parameters
    const urlObj = new URL(url);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    trackingParams.forEach(param => urlObj.searchParams.delete(param));
    
    // Remove trailing slashes
    let normalized = urlObj.toString();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  } catch {
    return url;
  }
}