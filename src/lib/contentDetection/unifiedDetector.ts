import { ContentType } from '@/types/database'
import {
  CONTENT_PATTERNS,
  FILE_EXTENSION_PATTERNS,
  CONTENT_TYPE_METADATA,
  PLATFORM_ID_PATTERNS,
  ContentTypeMetadata,
} from './patterns'

export interface DetectionResult {
  type: ContentType
  confidence: number
  metadata: ContentTypeMetadata
}

/**
 * Unified content type detection using database ContentType
 * This is the single source of truth for content type detection
 */
export function detectContentType(url: string): DetectionResult {
  try {
    const normalizedUrl = url.toLowerCase().trim()
    
    // Check specific platform patterns first (highest confidence)
    for (const [contentType, patterns] of Object.entries(CONTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedUrl)) {
          const type = contentType as ContentType
          return {
            type,
            confidence: 1.0,
            metadata: CONTENT_TYPE_METADATA[type],
          }
        }
      }
    }
    
    // Check file extensions
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    
    // PDF files
    if (FILE_EXTENSION_PATTERNS.pdf.test(pathname)) {
      return {
        type: 'pdf',
        confidence: 0.9,
        metadata: CONTENT_TYPE_METADATA.pdf,
      }
    }
    
    // Image files
    if (FILE_EXTENSION_PATTERNS.image.test(pathname)) {
      return {
        type: 'image',
        confidence: 0.9,
        metadata: CONTENT_TYPE_METADATA.image,
      }
    }
    
    // Video files
    if (FILE_EXTENSION_PATTERNS.video.test(pathname)) {
      return {
        type: 'video',
        confidence: 0.9,
        metadata: CONTENT_TYPE_METADATA.video,
      }
    }
    
    // Audio files
    if (FILE_EXTENSION_PATTERNS.audio.test(pathname)) {
      return {
        type: 'audio',
        confidence: 0.9,
        metadata: CONTENT_TYPE_METADATA.audio,
      }
    }
    
    // Document files
    if (FILE_EXTENSION_PATTERNS.document.test(pathname)) {
      return {
        type: 'documentation',
        confidence: 0.9,
        metadata: CONTENT_TYPE_METADATA.documentation,
      }
    }
    
    // Special cases based on domain
    const hostname = urlObj.hostname.toLowerCase()
    
    if (hostname.includes('arxiv.org')) {
      return {
        type: 'paper',
        confidence: 0.8,
        metadata: CONTENT_TYPE_METADATA.paper,
      }
    }
    
    if (hostname.includes('medium.com') || hostname.includes('substack.com')) {
      return {
        type: 'article',
        confidence: 0.8,
        metadata: CONTENT_TYPE_METADATA.article,
      }
    }
    
    if (hostname.includes('docs.google.com')) {
      if (pathname.includes('/document/')) {
        return {
          type: 'documentation',
          confidence: 0.8,
          metadata: CONTENT_TYPE_METADATA.documentation,
        }
      }
      if (pathname.includes('/presentation/')) {
        return {
          type: 'presentation',
          confidence: 0.8,
          metadata: CONTENT_TYPE_METADATA.presentation,
        }
      }
    }
    
    if (hostname.includes('notion.so')) {
      return {
        type: 'note',
        confidence: 0.8,
        metadata: CONTENT_TYPE_METADATA.note,
      }
    }
    
    // Default to bookmark for HTTP(S) URLs
    if (urlObj.protocol.startsWith('http')) {
      return {
        type: 'bookmark',
        confidence: 0.5,
        metadata: CONTENT_TYPE_METADATA.bookmark,
      }
    }
    
    // Unknown for non-HTTP URLs
    return {
      type: 'unknown',
      confidence: 0.3,
      metadata: CONTENT_TYPE_METADATA.unknown,
    }
  } catch (error) {
    // Invalid URL - treat as unknown
    return {
      type: 'unknown',
      confidence: 0.1,
      metadata: CONTENT_TYPE_METADATA.unknown,
    }
  }
}

/**
 * Extract platform-specific ID from URL
 */
export function extractPlatformId(url: string, type: ContentType): string | null {
  const extractor = PLATFORM_ID_PATTERNS[type]
  if (!extractor) return null
  
  try {
    return extractor(url)
  } catch {
    return null
  }
}

/**
 * Normalize URL for consistent detection
 */
export function normalizeUrl(url: string): string {
  try {
    // Handle Twitter/X domain variations
    url = url.replace(/^https?:\/\/(www\.)?twitter\.com/, 'https://x.com')
    
    // Remove tracking parameters
    const urlObj = new URL(url)
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid']
    trackingParams.forEach(param => urlObj.searchParams.delete(param))
    
    // Remove trailing slashes
    let normalized = urlObj.toString()
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1)
    }
    
    return normalized
  } catch {
    return url
  }
}

/**
 * Get content type capabilities
 */
export function getContentTypeCapabilities(type: ContentType): {
  requiresAuth: boolean
  hasTranscript: boolean
  hasComments: boolean
} {
  const metadata = CONTENT_TYPE_METADATA[type]
  return {
    requiresAuth: metadata.requiresAuth || false,
    hasTranscript: metadata.hasTranscript || false,
    hasComments: metadata.hasComments || false,
  }
}

/**
 * Legacy type mapping for backward compatibility
 * Maps old type names to new database ContentType
 */
export function mapLegacyType(oldType: string): ContentType {
  const mappings: Record<string, ContentType> = {
    'twitter': 'x',
    'link': 'bookmark',
    // Add more mappings as needed
  }
  
  return mappings[oldType] || (oldType as ContentType)
}