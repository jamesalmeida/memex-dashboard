import { ContentType } from '@/types/database'

// Centralized URL patterns for all content types
// Using database ContentType as the single source of truth
export const CONTENT_PATTERNS: Record<ContentType, RegExp[]> = {
  // Social Media
  x: [
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+$/,
  ],
  instagram: [
    /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/[\w.]+/,
  ],
  youtube: [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/)[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/live\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/@[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/channel\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/c\/[\w-]+/,
  ],
  linkedin: [
    /^https?:\/\/(www\.)?linkedin\.com\/posts\//,
    /^https?:\/\/(www\.)?linkedin\.com\/feed\/update\//,
    /^https?:\/\/(www\.)?linkedin\.com\/in\//,
  ],
  tiktok: [
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+/,
    /^https?:\/\/(vm|vt)\.tiktok\.com\/[\w-]+/,
  ],
  reddit: [
    /^https?:\/\/(www\.)?reddit\.com\/r\/\w+\/comments\/\w+/,
    /^https?:\/\/(www\.)?reddit\.com\/r\/\w+/,
    /^https?:\/\/(www\.)?reddit\.com\/user\/\w+/,
  ],
  facebook: [
    /^https?:\/\/(www\.)?facebook\.com\/[\w.]+\/posts\/\d+/,
    /^https?:\/\/(www\.)?facebook\.com\/[\w.]+\/videos\/\d+/,
    /^https?:\/\/(www\.)?facebook\.com\/watch/,
    /^https?:\/\/(www\.)?facebook\.com\/[\w.]+/,
  ],

  // Development
  github: [
    /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+/,
    /^https?:\/\/(www\.)?gist\.github\.com\//,
  ],
  gitlab: [
    /^https?:\/\/(www\.)?gitlab\.com\/[\w-]+\/[\w-]+/,
  ],
  codepen: [
    /^https?:\/\/(www\.)?codepen\.io\/[\w-]+\/pen\/[\w-]+/,
  ],
  stackoverflow: [
    /^https?:\/\/(www\.)?stackoverflow\.com\/questions\/\d+/,
  ],
  devto: [
    /^https?:\/\/(www\.)?dev\.to\/[\w-]+\/[\w-]+/,
  ],
  npm: [
    /^https?:\/\/(www\.)?npmjs\.com\/package\/[\w@/-]+/,
  ],
  documentation: [
    /^https?:\/\/docs\.[\w.-]+\.[\w]+/,
    /^https?:\/\/[\w.-]+\.readthedocs\.io/,
  ],

  // Content & Media
  article: [
    /^https?:\/\/([\w-]+\.)?medium\.com\//,
    /^https?:\/\/[\w-]+\.substack\.com\//,
    /^https?:\/\/(www\.)?notion\.so\//,
  ],
  pdf: [], // File extension based
  image: [], // File extension based
  video: [], // File extension based
  audio: [
    /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/[\w-]+/,
    /^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+\/[\w-]+/,
    /^https?:\/\/(www\.)?anchor\.fm\//,
    /^https?:\/\/(www\.)?overcast\.fm\//,
    /^https?:\/\/(www\.)?pocketcasts\.com\//,
    /^https?:\/\/(www\.)?castbox\.fm\//,
  ],
  presentation: [
    /^https?:\/\/(www\.)?slideshare\.net\//,
    /^https?:\/\/docs\.google\.com\/presentation\//,
  ],

  // Commerce
  product: [
    // Generic product patterns for various e-commerce sites
    /^https?:\/\/[^\/]+\/(store|shop|product|item|buy|purchase)\/[\w-]+/,
    /^https?:\/\/[^\/]+\/[\w-]+\/(store|shop|products?)\/[\w-]+/,
    // Matches patterns like teenage.engineering/store/tp-7
    /^https?:\/\/[^\/]+\.(engineering|design|tech|gear|audio)\/store\/[\w-]+/,
  ],
  amazon: [
    /^https?:\/\/(www\.)?amazon\.(com|co\.\w+|ca|de|fr|es|it|co\.uk|co\.jp|com\.br|com\.mx|com\.au|in|nl|sg|ae)\/.*\/dp\/[\w-]+/,
    /^https?:\/\/(www\.)?amazon\.(com|co\.\w+|ca|de|fr|es|it|co\.uk|co\.jp|com\.br|com\.mx|com\.au|in|nl|sg|ae)\/dp\/[\w-]+/,
    /^https?:\/\/(www\.)?amazon\.(com|co\.\w+|ca|de|fr|es|it|co\.uk|co\.jp|com\.br|com\.mx|com\.au|in|nl|sg|ae)\/gp\/product\/[\w-]+/,
    /^https?:\/\/(www\.)?amzn\.to\/[\w-]+/,  // Amazon short links
  ],
  etsy: [
    /^https?:\/\/(www\.)?etsy\.com\/listing\/\d+/,
    /^https?:\/\/(www\.)?etsy\.com\/[\w-]+\/listing\/\d+/,
  ],
  app: [
    /^https?:\/\/apps\.apple\.com\//,
    /^https?:\/\/play\.google\.com\/store\/apps\//,
  ],

  // Knowledge
  wikipedia: [
    /^https?:\/\/(\w+\.)?wikipedia\.org\/wiki\//,
  ],
  paper: [
    /^https?:\/\/(www\.)?arxiv\.org\//,
    /^https?:\/\/(www\.)?pubmed\.ncbi\.nlm\.nih\.gov\//,
    /^https?:\/\/(www\.)?scholar\.google\.com\//,
  ],
  book: [
    /^https?:\/\/(www\.)?goodreads\.com\/book\//,
    /^https?:\/\/(www\.)?amazon\.(com|co\.\w+|ca|de|fr|es|it|co\.uk|co\.jp|com\.br|com\.mx|com\.au|in|nl|sg|ae)\/.*\/dp\/\d{10}/,
  ],
  course: [
    /^https?:\/\/(www\.)?coursera\.org\//,
    /^https?:\/\/(www\.)?udemy\.com\//,
    /^https?:\/\/(www\.)?edx\.org\//,
    /^https?:\/\/(www\.)?khanacademy\.org\//,
  ],

  // Entertainment
  movie: [
    /^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+/,
    /^https?:\/\/(www\.)?netflix\.com\/title\/\d+/,
  ],
  'tv-show': [
    /^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+/,
    /^https?:\/\/(www\.)?netflix\.com\/title\/\d+/,
  ],

  // Personal
  note: [], // Internal notes, no URL pattern
  bookmark: [], // Generic bookmarks, fallback type
  recipe: [
    /^https?:\/\/(www\.)?allrecipes\.com\//,
    /^https?:\/\/(www\.)?foodnetwork\.com\//,
    /^https?:\/\/(www\.)?seriouseats\.com\//,
  ],
  location: [
    /^https?:\/\/(www\.)?google\.(com|[\w.]+)\/maps/,
    /^https?:\/\/maps\.google\.(com|[\w.]+)/,
    /^https?:\/\/goo\.gl\/maps\/[\w-]+/,
  ],
  
  // Fallback
  unknown: [], // No patterns - used as fallback
}

// File extension patterns for generic content types
export const FILE_EXTENSION_PATTERNS = {
  pdf: /\.pdf(?:\?.*)?$/i,
  image: /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff?)(?:\?.*)?$/i,
  video: /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv|m4v|mpg|mpeg)(?:\?.*)?$/i,
  audio: /\.(mp3|wav|flac|aac|ogg|wma|m4a|opus)(?:\?.*)?$/i,
  document: /\.(doc|docx|xls|xlsx|ppt|pptx|txt|rtf|odt|ods|odp)(?:\?.*)?$/i,
}

// Content type metadata
export interface ContentTypeMetadata {
  displayName: string
  icon: string // Icon name or emoji
  category: 'social' | 'development' | 'media' | 'commerce' | 'knowledge' | 'entertainment' | 'personal' | 'generic'
  requiresAuth?: boolean
  hasTranscript?: boolean
  hasComments?: boolean
}

export const CONTENT_TYPE_METADATA: Record<ContentType, ContentTypeMetadata> = {
  // Social Media
  x: { displayName: 'X', icon: '𝕏', category: 'social', hasComments: true },
  instagram: { displayName: 'Instagram', icon: '📷', category: 'social', hasComments: true },
  youtube: { displayName: 'YouTube', icon: '📺', category: 'media', hasTranscript: true, hasComments: true },
  linkedin: { displayName: 'LinkedIn', icon: '💼', category: 'social', hasComments: true, requiresAuth: true },
  tiktok: { displayName: 'TikTok', icon: '🎵', category: 'social', hasComments: true },
  reddit: { displayName: 'Reddit', icon: '🟠', category: 'social', hasComments: true },
  facebook: { displayName: 'Facebook', icon: '👤', category: 'social', hasComments: true, requiresAuth: true },
  
  // Development
  github: { displayName: 'GitHub', icon: '🐙', category: 'development' },
  gitlab: { displayName: 'GitLab', icon: '🦊', category: 'development' },
  codepen: { displayName: 'CodePen', icon: '🖊️', category: 'development' },
  stackoverflow: { displayName: 'Stack Overflow', icon: '🔧', category: 'development', hasComments: true },
  devto: { displayName: 'Dev.to', icon: '🖥️', category: 'development', hasComments: true },
  npm: { displayName: 'NPM', icon: '📦', category: 'development' },
  documentation: { displayName: 'Documentation', icon: '📚', category: 'development' },
  
  // Content & Media
  article: { displayName: 'Article', icon: '📄', category: 'media' },
  pdf: { displayName: 'PDF', icon: '📑', category: 'media' },
  image: { displayName: 'Image', icon: '🖼️', category: 'media' },
  video: { displayName: 'Video', icon: '🎥', category: 'media' },
  audio: { displayName: 'Audio', icon: '🎵', category: 'media' },
  presentation: { displayName: 'Presentation', icon: '📊', category: 'media' },
  
  // Commerce
  product: { displayName: 'Product', icon: '🛍️', category: 'commerce' },
  amazon: { displayName: 'Amazon', icon: '🛒', category: 'commerce' },
  etsy: { displayName: 'Etsy', icon: '🎨', category: 'commerce' },
  app: { displayName: 'App', icon: '📱', category: 'commerce' },
  
  // Knowledge
  wikipedia: { displayName: 'Wikipedia', icon: '📖', category: 'knowledge' },
  paper: { displayName: 'Academic Paper', icon: '🎓', category: 'knowledge' },
  book: { displayName: 'Book', icon: '📚', category: 'knowledge' },
  course: { displayName: 'Course', icon: '🎯', category: 'knowledge' },
  
  // Entertainment
  movie: { displayName: 'Movie', icon: '🎬', category: 'entertainment' },
  'tv-show': { displayName: 'TV Show', icon: '📺', category: 'entertainment' },
  
  // Personal
  note: { displayName: 'Note', icon: '📝', category: 'personal' },
  bookmark: { displayName: 'Bookmark', icon: '🔖', category: 'generic' },
  recipe: { displayName: 'Recipe', icon: '🍳', category: 'personal' },
  location: { displayName: 'Location', icon: '📍', category: 'personal' },
  
  // Fallback - for unknown content types
  unknown: { displayName: 'Unknown', icon: '❓', category: 'generic' },
}

// Platform ID extraction patterns
export const PLATFORM_ID_PATTERNS: Partial<Record<ContentType, (url: string) => string | null>> = {
  x: (url: string) => {
    const match = url.match(/status\/(\d+)/)
    return match ? match[1] : null
  },
  youtube: (url: string) => {
    const videoIdMatch = url.match(/(?:v=|\/shorts\/|\/embed\/|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (videoIdMatch) return videoIdMatch[1]
    
    const channelMatch = url.match(/\/@([\w-]+)/)
    if (channelMatch) return channelMatch[1]
    
    return null
  },
  instagram: (url: string) => {
    const match = url.match(/\/(p|reel|tv)\/([\w-]+)/)
    return match ? match[2] : null
  },
  tiktok: (url: string) => {
    const match = url.match(/video\/(\d+)/)
    return match ? match[1] : null
  },
  reddit: (url: string) => {
    const match = url.match(/comments\/(\w+)/)
    return match ? match[1] : null
  },
  github: (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2) {
        return `${pathParts[0]}/${pathParts[1]}`
      }
    } catch {}
    return null
  },
  amazon: (url: string) => {
    const match = url.match(/\/dp\/([A-Z0-9]+)/i)
    return match ? match[1] : null
  },
  spotify: (url: string) => {
    const match = url.match(/\/(track|album|playlist|artist)\/([\w-]+)/)
    return match ? `${match[1]}/${match[2]}` : null
  },
}