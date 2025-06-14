import type { ContentType } from '@/types/database'

export interface ExtractedMetadata {
  title: string
  description?: string
  thumbnail_url?: string
  profile_image?: string
  author?: string
  domain: string
  published_date?: string
  duration?: string
  views?: number
  stars?: number
  forks?: number
  language?: string
  price?: string
  rating?: number
  file_size?: string
  page_count?: number
  // Video specific fields
  video_url?: string
  video_type?: string
  video_width?: string
  video_height?: string
  likes?: number
  replies?: number
  retweets?: number
}

export interface UrlAnalysisResult {
  content_type: ContentType
  metadata: ExtractedMetadata
  confidence: number // 0-1 score for extraction confidence
}

// Platform-specific URL patterns
const PLATFORM_PATTERNS = {
  youtube: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
  ],
  x: [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /(?:twitter\.com|x\.com)\/(\w+)(?:\/)?$/
  ],
  github: [
    /github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?/
  ],
  instagram: [
    /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/
  ],
  linkedin: [
    /linkedin\.com\/posts\/.*-(\d+)-/,
    /linkedin\.com\/pulse\/([^\/]+)/
  ],
  reddit: [
    /reddit\.com\/r\/([^\/]+)\/comments\/([^\/]+)/
  ],
  tiktok: [
    /tiktok\.com\/@([^\/]+)\/video\/(\d+)/
  ],
  amazon: [
    /amazon\.com\/.*\/dp\/([A-Z0-9]+)/,
    /amazon\.com\/dp\/([A-Z0-9]+)/
  ],
  stackoverflow: [
    /stackoverflow\.com\/questions\/(\d+)/
  ],
  audio: [
    /podcasts\.apple\.com\/.*\/podcast\//,
    /open\.spotify\.com\/episode\//,
    /open\.spotify\.com\/show\//,
    /soundcloud\.com\//,
    /anchor\.fm\//,
    /overcast\.fm\//,
    /pocketcasts\.com\//,
    /castbox\.fm\//
  ],
  npm: [
    /npmjs\.com\/package\/([^\/]+)/
  ],
  wikipedia: [
    /(?:\w+\.)?wikipedia\.org\/wiki\/([^\/]+)/
  ]
}

// File extension patterns
const FILE_PATTERNS = {
  pdf: /\.pdf(?:\?.*)?$/i,
  image: /\.(jpg|jpeg|png|gif|webp|svg)(?:\?.*)?$/i,
  video: /\.(mp4|webm|ogg|avi|mov)(?:\?.*)?$/i,
  audio: /\.(mp3|wav|ogg|flac|aac)(?:\?.*)?$/i
}

export class UrlMetadataService {
  /**
   * Analyze a URL and extract metadata
   */
  async analyzeUrl(url: string): Promise<UrlAnalysisResult> {
    try {
      const normalizedUrl = this.normalizeUrl(url)
      const urlObj = new URL(normalizedUrl)
      
      // Detect content type and platform
      const contentType = this.detectContentType(normalizedUrl)
      
      // Extract platform-specific metadata
      const metadata = await this.extractMetadata(normalizedUrl, contentType)
      
      return {
        content_type: contentType,
        metadata,
        confidence: this.calculateConfidence(contentType, metadata)
      }
    } catch (error) {
      console.error('Error analyzing URL:', error)
      
      // Fallback analysis
      return {
        content_type: 'link',
        metadata: {
          title: url,
          domain: this.extractDomain(url)
        },
        confidence: 0.1
      }
    }
  }

  /**
   * Detect content type based on URL patterns
   */
  private detectContentType(url: string): ContentType {
    const urlLower = url.toLowerCase()
    
    // Check file extensions first
    for (const [type, pattern] of Object.entries(FILE_PATTERNS)) {
      if (pattern.test(url)) {
        return type as ContentType
      }
    }
    
    // Check platform patterns
    for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(url)) {
          return platform as ContentType
        }
      }
    }
    
    // Special cases
    if (urlLower.includes('arxiv.org')) return 'paper'
    if (urlLower.includes('medium.com') || urlLower.includes('substack.com')) return 'article'
    if (urlLower.includes('docs.google.com')) return 'documentation'
    if (urlLower.includes('notion.so')) return 'note'
    
    // Default to bookmark for HTTP(S) URLs
    return url.startsWith('http') ? 'bookmark' : 'note'
  }

  /**
   * Extract metadata based on content type
   */
  private async extractMetadata(url: string, contentType: ContentType): Promise<ExtractedMetadata> {
    const domain = this.extractDomain(url)
    
    // Base metadata
    const metadata: ExtractedMetadata = {
      title: this.generateFallbackTitle(url),
      domain
    }

    try {
      // Try to fetch and parse the page
      const pageData = await this.fetchPageMetadata(url)
      Object.assign(metadata, pageData)

      // Platform-specific enhancements
      switch (contentType) {
        case 'youtube':
          await this.enhanceYouTubeMetadata(url, metadata)
          break
        case 'github':
          await this.enhanceGitHubMetadata(url, metadata)
          break
        case 'x':
          await this.enhanceXMetadata(url, metadata)
          break
        case 'reddit':
          await this.enhanceRedditMetadata(url, metadata)
          break
        case 'amazon':
          await this.enhanceAmazonMetadata(url, metadata)
          break
        case 'stackoverflow':
          await this.enhanceStackOverflowMetadata(url, metadata)
          break
      }
    } catch (error) {
      console.error('Error extracting metadata for', url, error)
    }

    return metadata
  }

  /**
   * Fetch basic page metadata using Open Graph and meta tags
   */
  private async fetchPageMetadata(url: string): Promise<Partial<ExtractedMetadata>> {
    try {
      // Use a CORS proxy or server-side endpoint for fetching
      const response = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch page metadata:', error)
      return {}
    }
  }

  /**
   * Enhance YouTube video metadata
   */
  private async enhanceYouTubeMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]+)/)
    if (!videoIdMatch) return

    const videoId = videoIdMatch[1]
    
    // YouTube thumbnail patterns
    metadata.thumbnail_url = metadata.thumbnail_url || 
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    
    // Additional YouTube-specific metadata would require API key
    // For now, we'll rely on Open Graph data
  }

  /**
   * Enhance GitHub repository metadata
   */
  private async enhanceGitHubMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    const repoMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!repoMatch) return

    const [, owner, repo] = repoMatch
    
    try {
      // GitHub API doesn't require authentication for public repos
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      if (response.ok) {
        const repoData = await response.json()
        
        metadata.description = repoData.description || metadata.description
        metadata.stars = repoData.stargazers_count
        metadata.forks = repoData.forks_count
        metadata.language = repoData.language
        metadata.author = repoData.owner.login
      }
    } catch (error) {
      console.error('Failed to fetch GitHub metadata:', error)
    }
  }

  /**
   * Enhance Twitter/X post metadata
   */
  private async enhanceXMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    // Extract username and post ID from URL
    const statusMatch = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/)
    const profileMatch = url.match(/(?:twitter\.com|x\.com)\/(\w+)(?:\/)?$/)
    
    if (statusMatch) {
      const [, username, postId] = statusMatch
      // Don't override author if it's already set (display name from meta tags)
      if (!metadata.author) {
        metadata.author = `@${username}`
      }
      
      // Try to extract additional info from the title/description
      if (metadata.title) {
        // Twitter titles often contain the tweet text
        const tweetTextMatch = metadata.title.match(/^(.*?) on [X|Twitter]/i)
        if (tweetTextMatch) {
          metadata.description = metadata.description || tweetTextMatch[1]
        }
      }
      
      // Check if this might be a video tweet based on common indicators
      const hasVideoIndicators = metadata.title?.toLowerCase().includes('video') ||
                                metadata.description?.toLowerCase().includes('video') ||
                                metadata.video_url ||
                                metadata.thumbnail_url?.includes('video')
      
      if (hasVideoIndicators) {
        console.log('Video tweet detected based on content analysis')
      }
    } else if (profileMatch) {
      const [, username] = profileMatch
      // Don't override author if it's already set (display name from meta tags)
      if (!metadata.author) {
        metadata.author = `@${username}`
      }
    }
    
    // Set domain to indicate X/Twitter
    metadata.domain = url.includes('x.com') ? 'x.com' : 'twitter.com'
  }

  /**
   * Enhance Reddit post metadata
   */
  private async enhanceRedditMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    const subredditMatch = url.match(/reddit\.com\/r\/([^\/]+)/)
    if (subredditMatch) {
      metadata.author = metadata.author || `r/${subredditMatch[1]}`
    }
  }

  /**
   * Enhance Amazon product metadata
   */
  private async enhanceAmazonMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    // Amazon metadata would require web scraping or API access
    // For now, rely on Open Graph data
    if (url.includes('amazon.com')) {
      metadata.domain = 'amazon.com'
    }
  }

  /**
   * Enhance Stack Overflow metadata
   */
  private async enhanceStackOverflowMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    // Stack Overflow has good Open Graph support
    metadata.domain = 'stackoverflow.com'
  }

  /**
   * Normalize URL format
   */
  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(this.normalizeUrl(url)).hostname
    } catch {
      return url.split('/')[0] || url
    }
  }

  /**
   * Generate fallback title from URL
   */
  private generateFallbackTitle(url: string): string {
    try {
      const urlObj = new URL(this.normalizeUrl(url))
      const path = urlObj.pathname
      
      if (path && path !== '/') {
        // Clean up path to make a readable title
        return path
          .split('/')
          .filter(Boolean)
          .pop()
          ?.replace(/[-_]/g, ' ')
          .replace(/\.(html|php|aspx?)$/i, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ') || urlObj.hostname
      }
      
      return urlObj.hostname
    } catch {
      return url
    }
  }

  /**
   * Calculate confidence score for extraction
   */
  private calculateConfidence(contentType: ContentType, metadata: ExtractedMetadata): number {
    let score = 0.5 // Base score
    
    // Boost for recognized platforms
    if (contentType !== 'link' && contentType !== 'note') {
      score += 0.3
    }
    
    // Boost for rich metadata
    if (metadata.title && metadata.title !== metadata.domain) score += 0.1
    if (metadata.description) score += 0.1
    if (metadata.thumbnail_url) score += 0.1
    if (metadata.author) score += 0.1
    
    return Math.min(score, 1.0)
  }
}

// Export singleton instance
export const urlMetadataService = new UrlMetadataService()