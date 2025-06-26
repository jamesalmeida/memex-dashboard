// Centralized URL patterns for all content types
export const URL_PATTERNS = {
  // Social Media
  twitter: [
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+$/,
  ],
  instagram: [
    /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/[\w.]+/,
  ],
  tiktok: [
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+/,
    /^https?:\/\/(vm|vt)\.tiktok\.com\/[\w-]+/,
  ],
  youtube: [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/)[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/@[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/channel\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/c\/[\w-]+/,
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
  linkedin: [
    /^https?:\/\/(www\.)?linkedin\.com\/posts\//,
    /^https?:\/\/(www\.)?linkedin\.com\/feed\/update\//,
    /^https?:\/\/(www\.)?linkedin\.com\/in\//,
  ],
  pinterest: [
    /^https?:\/\/(www\.)?pinterest\.(com|co\.\w+)\/pin\/\d+/,
    /^https?:\/\/(www\.)?pinterest\.(com|co\.\w+)\/[\w-]+/,
  ],

  // Code & Development
  github: [
    /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+/,
    /^https?:\/\/(www\.)?gist\.github\.com\//,
  ],
  gitlab: [
    /^https?:\/\/(www\.)?gitlab\.com\/[\w-]+\/[\w-]+/,
  ],
  stackoverflow: [
    /^https?:\/\/(www\.)?stackoverflow\.com\/questions\/\d+/,
  ],
  codepen: [
    /^https?:\/\/(www\.)?codepen\.io\/[\w-]+\/pen\/[\w-]+/,
  ],

  // E-commerce & Products
  amazon: [
    /^https?:\/\/(www\.)?amazon\.(com|co\.\w+|ca|de|fr|es|it|jp|in|cn|com\.\w+)\/[\w-]+\/dp\/[\w-]+/,
    /^https?:\/\/(www\.)?amazon\.(com|co\.\w+|ca|de|fr|es|it|jp|in|cn|com\.\w+)\/gp\/product\/[\w-]+/,
  ],
  etsy: [
    /^https?:\/\/(www\.)?etsy\.com\/listing\/\d+/,
  ],
  ebay: [
    /^https?:\/\/(www\.)?ebay\.(com|co\.\w+|ca|de|fr|es|it)\/itm\/[\w-]+\/\d+/,
  ],
  shopify: [
    /^https?:\/\/[\w-]+\.myshopify\.com\/products\/[\w-]+/,
  ],

  // Media & Entertainment
  imdb: [
    /^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+/,
  ],
  netflix: [
    /^https?:\/\/(www\.)?netflix\.com\/title\/\d+/,
  ],
  spotify: [
    /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[\w-]+/,
  ],
  soundcloud: [
    /^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+\/[\w-]+/,
  ],
  twitch: [
    /^https?:\/\/(www\.)?twitch\.tv\/[\w-]+/,
    /^https?:\/\/(www\.)?twitch\.tv\/videos\/\d+/,
    /^https?:\/\/clips\.twitch\.tv\/[\w-]+/,
  ],
  vimeo: [
    /^https?:\/\/(www\.)?vimeo\.com\/\d+/,
    /^https?:\/\/player\.vimeo\.com\/video\/\d+/,
  ],

  // News & Articles
  medium: [
    /^https?:\/\/([\w-]+\.)?medium\.com\//,
    /^https?:\/\/[\w-]+\.medium\.com\//,
  ],
  substack: [
    /^https?:\/\/[\w-]+\.substack\.com\//,
  ],
  notion: [
    /^https?:\/\/(www\.)?notion\.so\//,
  ],

  // Images
  unsplash: [
    /^https?:\/\/(www\.)?unsplash\.com\/photos\/[\w-]+/,
  ],
  flickr: [
    /^https?:\/\/(www\.)?flickr\.com\/photos\/[\w@-]+\/\d+/,
  ],
  imgur: [
    /^https?:\/\/(www\.)?(i\.)?imgur\.com\/(gallery\/)?[\w-]+/,
  ],

  // Documents & Files
  googledocs: [
    /^https?:\/\/docs\.google\.com\/document\/d\/[\w-]+/,
  ],
  googlesheets: [
    /^https?:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+/,
  ],
  dropbox: [
    /^https?:\/\/(www\.)?dropbox\.com\/s\/[\w-]+/,
  ],
  
  // Maps & Locations
  googlemaps: [
    /^https?:\/\/(www\.)?google\.(com|[\w.]+)\/maps/,
    /^https?:\/\/maps\.google\.(com|[\w.]+)/,
    /^https?:\/\/goo\.gl\/maps\/[\w-]+/,
  ],
  
  // E-commerce
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
  ebay: [
    /^https?:\/\/(www\.)?ebay\.(com|co\.\w+|ca|de|fr|es|it|co\.uk|com\.au)\/itm\/[\w-]+\/\d+/,
    /^https?:\/\/(www\.)?ebay\.(com|co\.\w+|ca|de|fr|es|it|co\.uk|com\.au)\/i\/\d+/,
  ],
  shopify: [
    /^https?:\/\/[\w-]+\.myshopify\.com\/products\/[\w-]+/,
    /^https?:\/\/shop\.[\w-]+\.com\/products\/[\w-]+/,
  ],
  product: [
    // Generic product patterns for various e-commerce sites
    /^https?:\/\/[^\/]+\/(store|shop|product|item|buy|purchase)\/[\w-]+/,
    /^https?:\/\/[^\/]+\/[\w-]+\/(store|shop|products?)\/[\w-]+/,
    // Matches patterns like teenage.engineering/store/tp-7
    /^https?:\/\/[^\/]+\.(engineering|design|tech|gear|audio)\/store\/[\w-]+/,
  ],
} as const;

// Content type definitions
export type ContentType = 
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'reddit'
  | 'facebook'
  | 'linkedin'
  | 'pinterest'
  | 'github'
  | 'gitlab'
  | 'stackoverflow'
  | 'codepen'
  | 'amazon'
  | 'etsy'
  | 'ebay'
  | 'shopify'
  | 'imdb'
  | 'netflix'
  | 'spotify'
  | 'soundcloud'
  | 'twitch'
  | 'vimeo'
  | 'medium'
  | 'substack'
  | 'notion'
  | 'unsplash'
  | 'flickr'
  | 'imgur'
  | 'googledocs'
  | 'googlesheets'
  | 'dropbox'
  | 'googlemaps'
  | 'article'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'product'
  | 'note'
  | 'unknown';

// Content category definitions
export type ContentCategory = 
  | 'social'
  | 'code'
  | 'ecommerce'
  | 'media'
  | 'article'
  | 'image'
  | 'document'
  | 'location'
  | 'note'
  | 'unknown';

// Map content types to categories
export const CONTENT_TYPE_CATEGORIES: Record<ContentType, ContentCategory> = {
  // Social Media
  twitter: 'social',
  instagram: 'social',
  tiktok: 'social',
  youtube: 'media',
  reddit: 'social',
  facebook: 'social',
  linkedin: 'social',
  pinterest: 'social',
  
  // Code & Development
  github: 'code',
  gitlab: 'code',
  stackoverflow: 'code',
  codepen: 'code',
  
  // E-commerce
  amazon: 'ecommerce',
  etsy: 'ecommerce',
  ebay: 'ecommerce',
  shopify: 'ecommerce',
  
  // Media & Entertainment
  imdb: 'media',
  netflix: 'media',
  spotify: 'media',
  soundcloud: 'media',
  twitch: 'media',
  vimeo: 'media',
  
  // Articles
  medium: 'article',
  substack: 'article',
  notion: 'article',
  
  // Images
  unsplash: 'image',
  flickr: 'image',
  imgur: 'image',
  
  // Documents
  googledocs: 'document',
  googlesheets: 'document',
  dropbox: 'document',
  
  // Location
  googlemaps: 'location',
  
  // Generic types
  article: 'article',
  image: 'image',
  video: 'media',
  audio: 'media',
  document: 'document',
  product: 'ecommerce',
  note: 'note',
  unknown: 'unknown',
};

// File extension patterns for generic content types
export const FILE_EXTENSION_PATTERNS = {
  image: /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff?)$/i,
  video: /\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v|mpg|mpeg)$/i,
  audio: /\.(mp3|wav|flac|aac|ogg|wma|m4a|opus)$/i,
  document: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|odt|ods|odp)$/i,
};

// Content type metadata
export interface ContentTypeMetadata {
  displayName: string;
  icon: string; // Icon name or emoji
  category: ContentCategory;
  requiresAuth?: boolean;
  hasTranscript?: boolean;
  hasComments?: boolean;
}

export const CONTENT_TYPE_METADATA: Record<ContentType, ContentTypeMetadata> = {
  twitter: { displayName: 'X', icon: '𝕏', category: 'social', hasComments: true },
  instagram: { displayName: 'Instagram', icon: '📷', category: 'social', hasComments: true },
  tiktok: { displayName: 'TikTok', icon: '🎵', category: 'social', hasComments: true },
  youtube: { displayName: 'YouTube', icon: '📺', category: 'media', hasTranscript: true, hasComments: true },
  reddit: { displayName: 'Reddit', icon: '🟠', category: 'social', hasComments: true },
  facebook: { displayName: 'Facebook', icon: '👤', category: 'social', hasComments: true, requiresAuth: true },
  linkedin: { displayName: 'LinkedIn', icon: '💼', category: 'social', hasComments: true, requiresAuth: true },
  pinterest: { displayName: 'Pinterest', icon: '📌', category: 'social' },
  github: { displayName: 'GitHub', icon: '🐙', category: 'code' },
  gitlab: { displayName: 'GitLab', icon: '🦊', category: 'code' },
  stackoverflow: { displayName: 'Stack Overflow', icon: '🔧', category: 'code', hasComments: true },
  codepen: { displayName: 'CodePen', icon: '🖊️', category: 'code' },
  amazon: { displayName: 'Amazon', icon: '🛒', category: 'ecommerce' },
  etsy: { displayName: 'Etsy', icon: '🎨', category: 'ecommerce' },
  ebay: { displayName: 'eBay', icon: '🛍️', category: 'ecommerce' },
  shopify: { displayName: 'Shopify', icon: '🏪', category: 'ecommerce' },
  imdb: { displayName: 'IMDb', icon: '🎬', category: 'media' },
  netflix: { displayName: 'Netflix', icon: '🎞️', category: 'media', requiresAuth: true },
  spotify: { displayName: 'Spotify', icon: '🎵', category: 'media' },
  soundcloud: { displayName: 'SoundCloud', icon: '☁️', category: 'media' },
  twitch: { displayName: 'Twitch', icon: '🎮', category: 'media' },
  vimeo: { displayName: 'Vimeo', icon: '▶️', category: 'media' },
  medium: { displayName: 'Medium', icon: '📝', category: 'article' },
  substack: { displayName: 'Substack', icon: '✍️', category: 'article' },
  notion: { displayName: 'Notion', icon: '📋', category: 'article' },
  unsplash: { displayName: 'Unsplash', icon: '📸', category: 'image' },
  flickr: { displayName: 'Flickr', icon: '🖼️', category: 'image' },
  imgur: { displayName: 'Imgur', icon: '🖼️', category: 'image' },
  googledocs: { displayName: 'Google Docs', icon: '📄', category: 'document' },
  googlesheets: { displayName: 'Google Sheets', icon: '📊', category: 'document' },
  dropbox: { displayName: 'Dropbox', icon: '📦', category: 'document' },
  googlemaps: { displayName: 'Google Maps', icon: '🗺️', category: 'location' },
  article: { displayName: 'Article', icon: '📄', category: 'article' },
  image: { displayName: 'Image', icon: '🖼️', category: 'image' },
  video: { displayName: 'Video', icon: '🎥', category: 'media' },
  audio: { displayName: 'Audio', icon: '🎵', category: 'media' },
  document: { displayName: 'Document', icon: '📄', category: 'document' },
  product: { displayName: 'Product', icon: '🛍️', category: 'ecommerce' },
  note: { displayName: 'Note', icon: '📝', category: 'note' },
  unknown: { displayName: 'Link', icon: '🔗', category: 'unknown' },
};