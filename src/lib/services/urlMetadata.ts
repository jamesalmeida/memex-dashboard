import type { ContentType } from '@/types/database'
import { detectContentType as unifiedDetectContentType, normalizeUrl as unifiedNormalizeUrl } from '@/lib/contentDetection/unifiedDetector'

export interface ExtractedMetadata {
  title: string
  content?: string      // Main content (article body, tweet text, etc.)
  description?: string  // Summary or excerpt
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
  // Extended metadata storage
  extra_data?: Record<string, any>
}

export interface UrlAnalysisResult {
  content_type: ContentType
  metadata: ExtractedMetadata
  confidence: number // 0-1 score for extraction confidence
}

// Platform-specific URL patterns - REMOVED - Now using unified detector patterns
// See /src/lib/contentDetection/patterns.ts for all patterns

// Legacy platform patterns for metadata extraction only
const LEGACY_EXTRACTION_PATTERNS = {
  youtube: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]+)/
  ],
  x: [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /(?:twitter\.com|x\.com)\/(\w+)(?:\/)?$/
  ],
  github: [
    /github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?/
  ]
}

// File extension patterns - REMOVED - Now using unified detector
// See /src/lib/contentDetection/patterns.ts

export class UrlMetadataService {
  /**
   * Analyze a URL and extract metadata
   */
  async analyzeUrl(url: string): Promise<UrlAnalysisResult> {
    console.log('=== UrlMetadataService: analyzeUrl Started ===');
    console.log('Original URL:', url);
    
    try {
      const normalizedUrl = this.normalizeUrl(url)
      const urlObj = new URL(normalizedUrl)
      console.log('Normalized URL:', normalizedUrl);
      console.log('URL Object:', {
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        search: urlObj.search,
        protocol: urlObj.protocol
      });
      
      // Detect content type and platform
      const contentType = this.detectContentType(normalizedUrl)
      console.log('Detected content type:', contentType);
      
      // Extract platform-specific metadata
      const metadata = await this.extractMetadata(normalizedUrl, contentType)
      console.log('Extracted metadata:', JSON.stringify(metadata, null, 2));
      
      // Check if we need to update content type based on metadata
      let finalContentType = contentType;
      
      // Use og:type to refine content type detection
      const ogType = metadata.extra_data?.og?.type || metadata.extra_data?.og_type;
      if (ogType) {
        const ogTypeLower = ogType.toLowerCase();
        console.log('Using og:type for content type refinement:', ogType);
        
        // Map common og:type values to our content types
        if (ogTypeLower.includes('product') && contentType === 'bookmark') {
          finalContentType = 'product';
          console.log('Content type changed to product based on og:type');
        } else if (ogTypeLower.includes('article') && contentType === 'bookmark') {
          finalContentType = 'article';
          console.log('Content type changed to article based on og:type');
        } else if (ogTypeLower.includes('video') && contentType === 'bookmark') {
          finalContentType = 'video';
          console.log('Content type changed to video based on og:type');
        } else if (ogTypeLower.includes('book') && contentType === 'bookmark') {
          finalContentType = 'book';
          console.log('Content type changed to book based on og:type');
        }
      }
      
      // TV show detection for movies
      if (contentType === 'movie' && metadata.is_tv_show) {
        finalContentType = 'tv-show';
        console.log('Content type changed from movie to tv-show based on metadata');
      }
      
      const confidence = this.calculateConfidence(finalContentType, metadata);
      console.log('Confidence score:', confidence);
      
      const result = {
        content_type: finalContentType,
        metadata,
        confidence
      };
      
      console.log('Final metadata before return:', JSON.stringify(metadata, null, 2));
      console.log('=== UrlMetadataService: analyzeUrl Completed ===');
      return result;
    } catch (error) {
      console.error('Error analyzing URL:', error)
      
      // Fallback analysis
      const fallbackResult = {
        content_type: 'link' as ContentType,
        metadata: {
          title: url,
          domain: this.extractDomain(url)
        },
        confidence: 0.1
      };
      
      console.log('Fallback result:', fallbackResult);
      console.log('=== UrlMetadataService: analyzeUrl Failed (using fallback) ===');
      return fallbackResult;
    }
  }

  /**
   * Detect content type based on URL patterns
   */
  private detectContentType(url: string): ContentType {
    console.log('Detecting content type for URL:', url);
    const result = unifiedDetectContentType(url)
    console.log(`Detected content type: ${result.type} (confidence: ${result.confidence})`);
    return result.type
  }

  /**
   * Extract metadata based on content type
   */
  private async extractMetadata(url: string, contentType: ContentType): Promise<ExtractedMetadata> {
    console.log('Extracting metadata for URL:', url, 'Content type:', contentType);
    const domain = this.extractDomain(url)
    
    // Content types that should get automatic titles
    const contentTypesWithAutoTitle = ['youtube', 'audio', 'amazon', 'movie', 'tv-show'];
    
    // Base metadata - only add fallback title for specific content types
    const metadata: ExtractedMetadata = {
      title: contentTypesWithAutoTitle.includes(contentType) ? this.generateFallbackTitle(url) : '',
      domain,
      extra_data: {}
    }
    console.log('Base metadata:', metadata);

    try {
      // Try to fetch and parse the page
      console.log('Fetching page metadata from API...');
      const pageData = await this.fetchPageMetadata(url)
      console.log('Page metadata from API - keys:', Object.keys(pageData));
      console.log('Page metadata - has content?', !!pageData.content);
      console.log('Page metadata - has video_url?', !!pageData.video_url);
      
      // Don't use Object.assign for everything - be selective
      // This prevents undefined values from overwriting good data
      
      // Copy over non-undefined values from pageData
      if (pageData.title !== undefined) metadata.title = pageData.title;
      if (pageData.description !== undefined) metadata.description = pageData.description;
      if (pageData.content !== undefined) metadata.content = pageData.content;
      if (pageData.thumbnail_url !== undefined) metadata.thumbnail_url = pageData.thumbnail_url;
      if (pageData.author !== undefined) metadata.author = pageData.author;
      if (pageData.username !== undefined) metadata.username = pageData.username;
      if (pageData.display_name !== undefined) metadata.display_name = pageData.display_name;
      if (pageData.profile_image !== undefined) metadata.profile_image = pageData.profile_image;
      if (pageData.published_date !== undefined) metadata.published_date = pageData.published_date;
      if (pageData.video_url !== undefined) metadata.video_url = pageData.video_url;
      if (pageData.video_type !== undefined) metadata.video_type = pageData.video_type;
      if (pageData.video_width !== undefined) metadata.video_width = pageData.video_width;
      if (pageData.video_height !== undefined) metadata.video_height = pageData.video_height;
      if (pageData.likes !== undefined) metadata.likes = pageData.likes;
      if (pageData.replies !== undefined) metadata.replies = pageData.replies;
      if (pageData.retweets !== undefined) metadata.retweets = pageData.retweets;
      if (pageData.views !== undefined) metadata.views = pageData.views;
      if (pageData.stars !== undefined) metadata.stars = pageData.stars;
      if (pageData.forks !== undefined) metadata.forks = pageData.forks;
      if (pageData.language !== undefined) metadata.language = pageData.language;
      if (pageData.price !== undefined) metadata.price = pageData.price;
      if (pageData.rating !== undefined) metadata.rating = pageData.rating;
      if (pageData.duration !== undefined) metadata.duration = pageData.duration;
      if (pageData.file_size !== undefined) metadata.file_size = pageData.file_size;
      if (pageData.page_count !== undefined) metadata.page_count = pageData.page_count;
      
      // Store all Open Graph data in extra_data for future use
      if (!metadata.extra_data) {
        metadata.extra_data = {};
      }
      
      // Merge the entire extra_data object from pageData which now includes all OG tags
      if (pageData.extra_data) {
        metadata.extra_data = {
          ...metadata.extra_data,
          ...pageData.extra_data
        };
      }
      
      // Use og:image from extra_data if we don't have a thumbnail yet
      if (!metadata.thumbnail_url && metadata.extra_data?.og?.image) {
        metadata.thumbnail_url = metadata.extra_data.og.image;
        console.log('Using og:image as thumbnail:', metadata.thumbnail_url);
      }
      
      // Preserve Open Graph metadata (for backward compatibility)
      if (pageData.og_type) metadata.extra_data.og_type = pageData.og_type;
      if (pageData.og_url) metadata.extra_data.og_url = pageData.og_url;
      if (pageData.og_locale) metadata.extra_data.og_locale = pageData.og_locale;
      if (pageData.og_site_name) metadata.extra_data.og_site_name = pageData.og_site_name;
      
      // Store product-specific Open Graph data
      if (pageData.og_product_availability) metadata.extra_data.og_product_availability = pageData.og_product_availability;
      if (pageData.og_product_condition) metadata.extra_data.og_product_condition = pageData.og_product_condition;
      if (pageData.og_product_price_currency) metadata.extra_data.og_product_price_currency = pageData.og_product_price_currency;
      if (pageData.og_product_retailer_item_id) metadata.extra_data.og_product_retailer_item_id = pageData.og_product_retailer_item_id;
      
      // Store article-specific Open Graph data
      if (pageData.og_article_author) metadata.extra_data.og_article_author = pageData.og_article_author;
      if (pageData.og_article_section) metadata.extra_data.og_article_section = pageData.og_article_section;
      if (pageData.og_article_tag) metadata.extra_data.og_article_tag = pageData.og_article_tag;
      
      // Check if this response came from X API (it will have video_url or rich metrics)
      const isFromXApi = pageData.video_url || 
                        (pageData.likes !== undefined && pageData.likes !== null) ||
                        (pageData.views !== undefined && pageData.views !== null) ||
                        pageData.extra_data?.is_video;
      
      if (isFromXApi) {
        console.log('Detected X API response, preserving full data and skipping enhancements');
        // Make sure we have all the critical fields from pageData
        metadata.content = metadata.content || pageData.content;
        metadata.video_url = metadata.video_url || pageData.video_url;
        metadata.thumbnail_url = metadata.thumbnail_url || pageData.thumbnail_url;
        
        console.log('Metadata at X API return point:', JSON.stringify(metadata, null, 2));
        return metadata;
      }
      
      // For non-whitelisted content types, keep meaningful titles from Jina/API but clear generic ones
      if (!contentTypesWithAutoTitle.includes(contentType)) {
        // Check if we got a meaningful title from Jina or other extraction
        const hasJinaContent = pageData.extra_data && pageData.extra_data.content;
        const hasMeaningfulTitle = metadata.title && 
                                  metadata.title !== domain && 
                                  metadata.title !== url &&
                                  metadata.title.length > 10;
        
        // Special handling for Giphy - always keep title if it contains GIF
        const isGiphyWithTitle = url.includes('giphy.com') && metadata.title && metadata.title.includes('GIF');
        
        if (!hasJinaContent && !hasMeaningfulTitle && !isGiphyWithTitle) {
          // Only clear if we don't have Jina content and the title isn't meaningful
          metadata.title = '';
          console.log('Cleared generic title for non-whitelisted content type:', contentType);
        } else {
          console.log('Keeping meaningful title from extraction:', metadata.title);
        }
      }

      // Platform-specific enhancements
      console.log('Applying platform-specific enhancements for:', contentType);
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
        case 'instagram':
          await this.enhanceInstagramMetadata(url, metadata)
          break
        case 'tiktok':
          await this.enhanceTikTokMetadata(url, metadata)
          break
        case 'movie':
        case 'tv-show':
          await this.enhanceMovieMetadata(url, metadata)
          break
        case 'video':
          // Check if it's an IMDB URL and enhance as movie
          if (url.includes('imdb.com/title/')) {
            await this.enhanceMovieMetadata(url, metadata)
          }
          break
        case 'image':
          // For images, extract filename and put it in description
          this.enhanceImageMetadata(url, metadata)
          break
      }
      
      // Final cleanup: For non-whitelisted content types, only clear generic titles
      if (!contentTypesWithAutoTitle.includes(contentType)) {
        const hasJinaContent = metadata.extra_data && metadata.extra_data.content;
        const hasMeaningfulTitle = metadata.title && 
                                  metadata.title !== domain && 
                                  metadata.title !== url &&
                                  metadata.title.length > 10;
        
        // Special handling for Giphy - always keep title if it contains GIF
        const isGiphyWithTitle = url.includes('giphy.com') && metadata.title && metadata.title.includes('GIF');
        
        if (!hasJinaContent && !hasMeaningfulTitle && !isGiphyWithTitle) {
          metadata.title = '';
          console.log('Final cleanup: Cleared generic title');
        }
      }
      
      console.log('Final metadata after enhancements:', {
        title: metadata.title,
        content: metadata.content,
        domain: metadata.domain,
        description: metadata.description,
        thumbnail_url: metadata.thumbnail_url,
        author: metadata.author,
        username: metadata.username,
        display_name: metadata.display_name,
        profile_image: metadata.profile_image,
        extra_data: metadata.extra_data
      });
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
      console.log('Calling backend API to extract metadata for:', url);
      
      // Determine the base URL based on environment
      const baseUrl = typeof window !== 'undefined' 
        ? '' // Client-side: use relative URL
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Server-side: use full URL
      
      const apiUrl = `${baseUrl}/api/extract-metadata`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch page metadata:', error)
      return {}
    }
  }

  /**
   * Enhance YouTube video metadata
   */
  private async enhanceYouTubeMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    console.log('Enhancing YouTube metadata for:', url);
    
    try {
      // Use our YouTube.js API to get comprehensive metadata
      const response = await fetch('/api/youtube-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('YouTube metadata from API:', data);
        
        if (data.success && data.metadata) {
          const ytData = data.metadata;
          
          // Override with richer YouTube.js data
          metadata.title = ytData.title || metadata.title;
          metadata.description = ytData.description || metadata.description;
          metadata.duration = ytData.duration || metadata.duration;
          metadata.views = ytData.view_count || metadata.views;
          metadata.likes = ytData.like_count || metadata.likes;
          metadata.published_date = ytData.upload_date || metadata.published_date;
          
          // Channel information
          metadata.author = ytData.channel.name || metadata.author;
          metadata.profile_image = ytData.channel.avatar || metadata.profile_image;
          
          // Use traditional high-quality YouTube thumbnail URL (always highest quality)
          const videoIdMatch = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]+)/);
          if (videoIdMatch) {
            const videoId = videoIdMatch[1];
            metadata.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          } else {
            // Fallback to YouTube.js thumbnails if we can't extract video ID
            metadata.thumbnail_url = ytData.thumbnails.maxres || 
                                     ytData.thumbnails.high || 
                                     ytData.thumbnails.medium || 
                                     ytData.thumbnails.default || 
                                     metadata.thumbnail_url;
          }
          
          // Store additional YouTube-specific data in extra_data
          metadata.extra_data = {
            ...metadata.extra_data,
            youtube: {
              channel_id: ytData.channel.id,
              channel_url: ytData.channel.url,
              channel_subscribers: ytData.channel.subscriber_count,
              category: ytData.category,
              language: ytData.language,
              tags: ytData.tags,
              is_live: ytData.is_live,
              is_upcoming: ytData.is_upcoming
            }
          };
          
          console.log('Enhanced metadata with YouTube.js data');
        }
      } else {
        console.warn('YouTube metadata API failed, falling back to basic enhancement');
        this.fallbackYouTubeMetadata(url, metadata);
      }
    } catch (error) {
      console.error('Failed to fetch YouTube metadata:', error);
      this.fallbackYouTubeMetadata(url, metadata);
    }
  }

  private fallbackYouTubeMetadata(url: string, metadata: ExtractedMetadata): void {
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]+)/)
    if (!videoIdMatch) return

    const videoId = videoIdMatch[1]
    
    // YouTube thumbnail patterns
    metadata.thumbnail_url = metadata.thumbnail_url || 
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    
    console.log('Using fallback YouTube metadata');
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
    console.log('!!!! enhanceXMetadata SHOULD NOT BE CALLED for X API responses!');
    console.log('Enhancing X metadata for:', url);
    console.log('Initial metadata:', JSON.stringify(metadata, null, 2));
    
    // Extract username and post ID from URL
    const statusMatch = url.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/)
    const profileMatch = url.match(/(?:twitter\.com|x\.com)\/(\w+)(?:\/)?$/)
    
    if (statusMatch) {
      const [, urlUsername] = statusMatch
      
      // Set username from URL if not already set
      if (!metadata.username) {
        metadata.username = urlUsername
        console.log('Set username from URL:', urlUsername)
      }
      
      // Extract tweet content from title and clear the title
      if (metadata.title) {
        // Try different patterns to extract tweet text
        let tweetContent = metadata.title
        
        // Pattern 1: "Display Name on X: tweet content"
        const pattern1 = metadata.title.match(/^.*? on (?:X|Twitter):\s*"?(.+?)"?$/i)
        if (pattern1) {
          tweetContent = pattern1[1].replace(/"$/, '')
        } else {
          // Pattern 2: Just remove " / X" or " / Twitter" from end
          tweetContent = metadata.title.replace(/\s*\/\s*(?:X|Twitter)$/i, '')
        }
        
        metadata.content = tweetContent
        console.log('Extracted tweet content:', tweetContent)
      }
      
      // If we have description and no content yet, use description as content
      if (metadata.description && !metadata.content) {
        metadata.content = metadata.description
      }
      
      // Clear title and description for X posts
      metadata.title = ''
      metadata.description = undefined
      console.log('Cleared title and description for X post')
      
      // Set author format as @username if not already set with display name
      if (!metadata.author || metadata.author === `@${urlUsername}`) {
        // If we have display_name, use format: "Display Name (@username)"
        if (metadata.display_name) {
          metadata.author = `${metadata.display_name} (@${metadata.username})`
        } else {
          metadata.author = `@${metadata.username}`
        }
        console.log('Set author:', metadata.author)
      }
    } else if (profileMatch) {
      const [, username] = profileMatch
      if (!metadata.username) {
        metadata.username = username
      }
      if (!metadata.author) {
        metadata.author = `@${username}`
      }
    }
    
    // Set domain to indicate X/Twitter
    metadata.domain = url.includes('x.com') ? 'x.com' : 'twitter.com'
    
    console.log('Final enhanced X metadata:', {
      title: metadata.title,
      content: metadata.content,
      username: metadata.username,
      display_name: metadata.display_name,
      author: metadata.author,
      profile_image: metadata.profile_image
    })
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
   * Enhance Instagram metadata
   */
  private async enhanceInstagramMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    console.log('=== CLIENT-SIDE INSTAGRAM ENHANCEMENT ===');
    console.log('Raw Instagram metadata from API:', metadata);
    
    // Process Instagram-specific fields from the API response
    if (metadata.instagram_engagement) {
      console.log('Processing Instagram engagement data:', metadata.instagram_engagement);
      
      // Set author from Instagram username if available
      if (metadata.instagram_engagement.username && !metadata.author?.includes(metadata.instagram_engagement.username)) {
        metadata.author = `@${metadata.instagram_engagement.username}`;
        console.log('Set author from Instagram engagement:', metadata.author);
      }
      
      // Set username and display_name for easier access
      if (metadata.instagram_engagement.username) {
        metadata.username = metadata.instagram_engagement.username;
        metadata.display_name = metadata.instagram_engagement.username;
        console.log('Set username and display_name:', metadata.username);
      }
      
      // Use clean description as title if available
      if (metadata.instagram_engagement.clean_description) {
        metadata.title = metadata.instagram_engagement.clean_description;
        console.log('Set title from clean description:', metadata.title);
      }
    }
    
    // Also check for standalone Instagram username/display_name fields
    if (metadata.instagram_username) {
      metadata.username = metadata.instagram_username;
      metadata.display_name = metadata.instagram_display_name || metadata.instagram_username;
      console.log('Set username from standalone field:', metadata.username);
      
      // Update author if not already set correctly
      if (!metadata.author?.includes(metadata.instagram_username)) {
        metadata.author = `@${metadata.instagram_username}`;
        console.log('Set author from standalone Instagram username:', metadata.author);
      }
    }
    
    metadata.domain = 'instagram.com';
    console.log('Final enhanced Instagram metadata:', metadata);
  }

  /**
   * Enhance TikTok metadata
   */
  private async enhanceTikTokMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    console.log('=== CLIENT-SIDE TIKTOK ENHANCEMENT ===');
    console.log('Raw TikTok metadata from API:', metadata);
    
    // Extract username and video ID from TikTok URL
    const tikTokMatch = url.match(/tiktok\.com\/@([^\/]+)\/video\/(\d+)/);
    if (tikTokMatch) {
      const [, username, videoId] = tikTokMatch;
      
      // Set username if not already available
      if (!metadata.username && username) {
        metadata.username = username;
        metadata.display_name = username;
        console.log('Set username from URL:', username);
      }
      
      // Set author if not already set
      if (!metadata.author && username) {
        metadata.author = `@${username}`;
        console.log('Set author from URL:', metadata.author);
      }
      
      // Try to generate a thumbnail URL (TikTok doesn't have predictable patterns like YouTube)
      // But we can try some common patterns or use a fallback
      if (!metadata.thumbnail_url) {
        // TikTok thumbnails are harder to predict, but we can try some approaches
        console.log('No thumbnail available from API, using TikTok logo fallback');
        // For now, we'll leave it undefined and let the card handle the fallback
      }
      
      // Video ID for potential future API integration
      console.log('TikTok Video ID:', videoId);
    }
    
    // Process TikTok-specific fields from the API response
    if (metadata.tiktok_engagement) {
      console.log('Processing TikTok engagement data:', metadata.tiktok_engagement);
      
      // Extract engagement metrics
      if (metadata.tiktok_engagement.likes) {
        metadata.likes = metadata.tiktok_engagement.likes;
        console.log('Set likes from TikTok engagement:', metadata.likes);
      }
      
      if (metadata.tiktok_engagement.views) {
        metadata.views = metadata.tiktok_engagement.views;
        console.log('Set views from TikTok engagement:', metadata.views);
      }
      
      if (metadata.tiktok_engagement.comments) {
        metadata.replies = metadata.tiktok_engagement.comments;
        console.log('Set comments from TikTok engagement:', metadata.replies);
      }
      
      if (metadata.tiktok_engagement.shares) {
        metadata.retweets = metadata.tiktok_engagement.shares; // Reuse retweets field for shares
        console.log('Set shares from TikTok engagement:', metadata.retweets);
      }
      
      // Username and display name from engagement data
      if (metadata.tiktok_engagement.username) {
        metadata.username = metadata.tiktok_engagement.username;
        metadata.display_name = metadata.tiktok_engagement.display_name || metadata.tiktok_engagement.username;
        metadata.author = `@${metadata.tiktok_engagement.username}`;
        console.log('Updated author from engagement data:', metadata.author);
      }
      
      // Duration for videos
      if (metadata.tiktok_engagement.duration) {
        metadata.duration = metadata.tiktok_engagement.duration;
        console.log('Set duration from TikTok engagement:', metadata.duration);
      }
      
      // Music/sound info
      if (metadata.tiktok_engagement.music) {
        metadata.description = metadata.description ? 
          `${metadata.description}\n\n🎵 ${metadata.tiktok_engagement.music}` : 
          `🎵 ${metadata.tiktok_engagement.music}`;
        console.log('Added music info to description');
      }
    }
    
    // Also check for standalone TikTok fields
    if (metadata.tiktok_username) {
      metadata.username = metadata.tiktok_username;
      metadata.display_name = metadata.tiktok_display_name || metadata.tiktok_username;
      if (!metadata.author?.includes(metadata.tiktok_username)) {
        metadata.author = `@${metadata.tiktok_username}`;
        console.log('Set author from standalone TikTok username:', metadata.author);
      }
    }
    
    // Extract hashtags from description/title for TikTok context
    const text = `${metadata.title || ''} ${metadata.description || ''}`;
    const hashtags = text.match(/#[\w]+/g);
    if (hashtags && hashtags.length > 0) {
      console.log('Found hashtags in TikTok content:', hashtags);
      // Could store hashtags in a tags field if needed
    }
    
    // Clean up generic TikTok title
    if (metadata.title === 'TikTok - Make Your Day' || metadata.title?.startsWith('TikTok - ')) {
      // Use a more descriptive title based on username if available
      if (metadata.username) {
        metadata.title = `@${metadata.username} on TikTok`;
        console.log('Cleaned up generic TikTok title:', metadata.title);
      } else {
        metadata.title = 'TikTok Video';
        console.log('Set fallback TikTok title');
      }
    }
    
    metadata.domain = 'tiktok.com';
    console.log('Final enhanced TikTok metadata:', metadata);
  }

  /**
   * Enhance Movie/IMDB metadata
   */
  private async enhanceMovieMetadata(url: string, metadata: ExtractedMetadata): Promise<void> {
    console.log('=== CLIENT-SIDE MOVIE ENHANCEMENT ===');
    console.log('Raw Movie metadata from API:', metadata);
    
    // Extract IMDB ID from URL
    const imdbMatch = url.match(/imdb\.com\/title\/([a-z0-9]+)/i);
    if (imdbMatch) {
      const [, imdbId] = imdbMatch;
      console.log('IMDB ID:', imdbId);
      
      // Store IMDB ID for potential future API integration
      metadata.imdb_id = imdbId;
    }
    
    // Process movie-specific fields from the API response
    if (metadata.movie_data) {
      console.log('Processing movie data:', metadata.movie_data);
      
      // Extract movie details
      if (metadata.movie_data.year) {
        metadata.published_date = metadata.movie_data.year;
        console.log('Set year from movie data:', metadata.published_date);
      }
      
      if (metadata.movie_data.director) {
        metadata.author = metadata.movie_data.director;
        console.log('Set director as author:', metadata.author);
      }
      
      if (metadata.movie_data.rating) {
        metadata.rating = metadata.movie_data.rating;
        console.log('Set rating from movie data:', metadata.rating);
      }
      
      if (metadata.movie_data.duration) {
        metadata.duration = metadata.movie_data.duration;
        console.log('Set duration from movie data:', metadata.duration);
      }
      
      if (metadata.movie_data.genre) {
        metadata.genre = metadata.movie_data.genre;
        console.log('Set genre from movie data:', metadata.genre);
      }
      
      if (metadata.movie_data.cast) {
        metadata.cast = metadata.movie_data.cast;
        console.log('Set cast from movie data:', metadata.cast);
      }
    }
    
    // Also check for standalone movie fields
    if (metadata.imdb_rating) {
      metadata.rating = metadata.imdb_rating;
      console.log('Set rating from standalone field:', metadata.rating);
    }
    
    if (metadata.movie_year) {
      metadata.published_date = metadata.movie_year;
      console.log('Set year from standalone field:', metadata.published_date);
    }
    
    if (metadata.movie_director) {
      metadata.author = metadata.movie_director;
      console.log('Set director from standalone field:', metadata.author);
    }
    
    // Detect if this is a TV show vs movie from content
    const titleLower = metadata.title?.toLowerCase() || '';
    const descriptionLower = metadata.description?.toLowerCase() || '';
    
    const tvIndicators = [
      'tv series', 'tv show', 'television series', 'series', 'season', 'episode',
      'seasons', 'episodes', 'tv-', 'miniseries', 'mini-series'
    ];
    
    const isTvShow = tvIndicators.some(indicator => 
      titleLower.includes(indicator) || descriptionLower.includes(indicator)
    );
    
    if (isTvShow) {
      console.log('Detected TV show, changing content type');
      // We'll need to handle this in the calling code since we can't change content_type here
      metadata.is_tv_show = true;
      
      // Parse TV show title to extract main title and move extra info to description
      if (metadata.title) {
        const originalTitle = metadata.title;
        const originalDescription = metadata.description || '';
        
        // Pattern for TV show titles like "Breaking Bad (TV Series 2008–2013) ⭐ 9.5 | Crime, Drama, Thriller"
        const tvTitleMatch = originalTitle.match(/^([^(]+?)(?:\s*\(([^)]*)\))?\s*(?:⭐|★)?\s*([\d.]+)?\s*(?:\|\s*(.+))?$/);
        if (tvTitleMatch) {
          const [, cleanTitle, yearInfo, rating, genres] = tvTitleMatch;
          
          // Keep title with years: "Breaking Bad (2008-2013)"
          if (yearInfo) {
            // Extract just the years from "TV Series 2008–2013" format
            const yearMatch = yearInfo.match(/(\d{4}(?:[–-]\d{4})?)/);
            if (yearMatch) {
              const years = yearMatch[1].replace('–', '-'); // Replace em-dash with hyphen
              metadata.title = `${cleanTitle.trim()} (${years})`;
            } else {
              metadata.title = cleanTitle.trim();
            }
          } else {
            metadata.title = cleanTitle.trim();
          }
          
          // Move only rating and genres to description
          const extraInfo = [];
          
          // Add rating if available
          if (rating) {
            extraInfo.push(`⭐ ${rating}`);
          }
          
          // Add genres
          if (genres) {
            extraInfo.push(genres.trim());
          }
          
          // Combine original description with extracted info (only if there's rating or genres)
          if (extraInfo.length > 0) {
            const newDescription = [originalDescription, extraInfo.join(' | ')].filter(Boolean).join('\n\n');
            if (newDescription.trim()) {
              metadata.description = newDescription;
            }
          }
          
          console.log('Parsed TV show title:', {
            original: originalTitle,
            cleaned: metadata.title,
            extraInfo: extraInfo,
            newDescription: metadata.description
          });
        } else {
          // Fallback: just remove common TV show patterns from title
          metadata.title = metadata.title
            .replace(/\s*\(TV Series[^)]*\)/i, '')
            .replace(/\s*⭐\s*[\d.]+/g, '')
            .replace(/\s*\|\s*.+$/, '')
            .trim();
          console.log('Applied fallback TV title cleanup:', metadata.title);
        }
      }
    }
    
    // Clean up movie/TV show titles
    if (metadata.title) {
      const originalTitle = metadata.title;
      const originalDescription = metadata.description || '';
      
      // Remove "IMDb" suffix if present
      if (originalTitle.includes(' - IMDb')) {
        metadata.title = originalTitle.replace(' - IMDb', '');
      }
      
      // Parse movie titles like "PCU (1994) ⭐ 6.6 | Comedy" 
      // Keep title and year, move rating and genres to description
      if (!metadata.is_tv_show) {
        const movieTitleMatch = metadata.title.match(/^([^(]+?)(?:\s*\((\d{4})\))?\s*(?:⭐|★)?\s*([\d.]+)?\s*(?:\|\s*(.+))?$/);
        if (movieTitleMatch) {
          const [, cleanTitle, year, rating, genres] = movieTitleMatch;
          
          // Keep title with year: "Movie Title (Year)"
          if (year) {
            metadata.title = `${cleanTitle.trim()} (${year})`;
          } else {
            metadata.title = cleanTitle.trim();
          }
          
          // Move only rating and genres to description
          const extraInfo = [];
          
          // Add rating if available
          if (rating) {
            extraInfo.push(`⭐ ${rating}`);
          }
          
          // Add genres
          if (genres) {
            extraInfo.push(genres.trim());
          }
          
          // Combine original description with extracted info (only if there's rating or genres)
          if (extraInfo.length > 0) {
            const newDescription = [originalDescription, extraInfo.join(' | ')].filter(Boolean).join('\n\n');
            if (newDescription.trim()) {
              metadata.description = newDescription;
            }
          }
          
          console.log('Parsed movie title:', {
            original: originalTitle,
            cleaned: metadata.title,
            extraInfo: extraInfo,
            newDescription: metadata.description
          });
        }
      }
      
      console.log('Final cleaned title:', metadata.title);
    }
    
    metadata.domain = 'imdb.com';
    console.log('Final enhanced movie metadata:', metadata);
  }

  /**
   * Normalize URL format
   */
  private normalizeUrl(url: string): string {
    return unifiedNormalizeUrl(url)
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

  /**
   * Enhance image metadata by extracting filename
   */
  private enhanceImageMetadata(url: string, metadata: ExtractedMetadata): void {
    console.log('Enhancing image metadata for:', url);
    
    try {
      const urlObj = new URL(this.normalizeUrl(url));
      const pathname = urlObj.pathname;
      
      // Special handling for Giphy URLs
      if (url.includes('giphy.com')) {
        console.log('Detected Giphy URL, processing Jina content');
        
        // For Giphy, keep the extracted title if it's meaningful
        if (metadata.title && metadata.title.includes('GIF')) {
          console.log('Keeping Giphy title:', metadata.title);
        }
        
        // Process Jina markdown content to extract better description
        if (metadata.extra_data?.content) {
          const jinaContent = metadata.extra_data.content;
          console.log('Processing Jina content for Giphy:', jinaContent);
          
          // Extract the alt text from the main GIF image
          // Look for pattern like: Movie gif. Leonardo DiCaprio as Jay...
          const altTextMatch = jinaContent.match(/\[Image \d+: ([^\]]+)\]/);
          if (altTextMatch) {
            metadata.description = altTextMatch[1].trim();
            console.log('Extracted description from Jina alt text:', metadata.description);
          } else if (metadata.description === 'giphy.gif' || !metadata.description) {
            // Fallback: Extract GIF ID from URL
            const giphyMatch = url.match(/(?:gifs\/[^\/]+-)?([a-zA-Z0-9]+)(?:\/giphy\.gif)?$/);
            if (giphyMatch) {
              metadata.description = `Giphy GIF (ID: ${giphyMatch[1]})`;
            } else {
              metadata.description = 'Animated GIF from Giphy';
            }
          }
          
          // Clear the markdown content from being stored as content
          metadata.content = '';
          delete metadata.extra_data.content;
        }
        
        // Extract the actual GIF URL from Jina's URL Source if available
        if (metadata.extra_data?.url) {
          metadata.thumbnail_url = metadata.extra_data.url;
          console.log('Using Jina URL source as thumbnail:', metadata.thumbnail_url);
        } else if (!metadata.thumbnail_url || !metadata.thumbnail_url.includes('.gif')) {
          // Ensure we use the actual GIF URL as thumbnail
          metadata.thumbnail_url = url;
        }
        
        console.log('Enhanced Giphy metadata:', metadata);
        return;
      }
      
      // For non-Giphy images, use the existing logic
      // Extract filename from path
      const filename = pathname.split('/').pop() || '';
      
      // Clean up filename by removing query params and decoding
      const cleanFilename = decodeURIComponent(filename.split('?')[0]);
      
      // Clear title and set filename as description
      metadata.title = '';
      metadata.description = cleanFilename;
      
      // Set the image URL as thumbnail
      metadata.thumbnail_url = url;
      
      console.log('Enhanced image metadata:', metadata);
    } catch (error) {
      console.error('Error enhancing image metadata:', error);
    }
  }
}

// Export singleton instance
export const urlMetadataService = new UrlMetadataService()