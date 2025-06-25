import { ExtractedMetadata } from './urlMetadata';
import { xApiRateLimiter } from './xApiRateLimitPersistent';

interface XApiTweet {
  data: {
    id: string;
    text: string;
    created_at: string;
    author_id: string;
    attachments?: {
      media_keys?: string[];
    };
    public_metrics?: {
      retweet_count: number;
      reply_count: number;
      like_count: number;
      quote_count: number;
      impression_count: number;
    };
  };
  includes?: {
    media?: Array<{
      media_key: string;
      type: 'photo' | 'video' | 'animated_gif';
      url?: string; // For photos
      preview_image_url?: string; // For videos and GIFs
      duration_ms?: number; // For videos
      height?: number;
      width?: number;
      variants?: Array<{
        bit_rate?: number;
        content_type: string;
        url: string;
      }>;
    }>;
    users?: Array<{
      id: string;
      name: string;
      username: string;
      profile_image_url?: string;
      verified?: boolean;
    }>;
  };
}

export class XApiService {
  private bearerToken: string;
  private apiKey: string;
  private apiKeySecret: string;
  private baseUrl = 'https://api.twitter.com/2';

  constructor() {
    // In server environment, these should be available
    this.bearerToken = process.env.X_BEARER_TOKEN || '';
    this.apiKey = process.env.X_API_KEY || '';
    this.apiKeySecret = process.env.X_API_KEY_SECRET || '';
    
    console.log('X API Service initialized:', {
      hasBearerToken: !!this.bearerToken,
      hasApiKey: !!this.apiKey,
      bearerTokenLength: this.bearerToken.length,
      env: typeof window === 'undefined' ? 'server' : 'browser'
    });
    
    if (!this.bearerToken) {
      console.warn('X API Bearer Token not found in environment variables');
    }
  }

  /**
   * Extract tweet ID from URL
   */
  private extractTweetId(url: string): string | null {
    const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Fetch tweet data using X API v2
   */
  async fetchTweet(url: string): Promise<Partial<ExtractedMetadata> | null> {
    if (!this.bearerToken) {
      console.log('X API Bearer Token not available, skipping X API fetch');
      return null;
    }

    // Check rate limits before making request
    if (await xApiRateLimiter.shouldSkipRequest()) {
      console.log('Skipping X API request due to rate limit');
      return null;
    }

    const tweetId = this.extractTweetId(url);
    if (!tweetId) {
      console.log('Could not extract tweet ID from URL:', url);
      return null;
    }

    console.log('=== XApiService: Fetching tweet:', tweetId);

    try {
      // Build query with expansions and fields
      const params = new URLSearchParams({
        'ids': tweetId,
        'expansions': 'attachments.media_keys,author_id',
        'media.fields': 'duration_ms,height,preview_image_url,type,url,width,variants',
        'tweet.fields': 'created_at,public_metrics',
        'user.fields': 'name,username,profile_image_url,verified'
      });

      const response = await fetch(`${this.baseUrl}/tweets?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        }
      });

      // Update rate limit info from headers
      await xApiRateLimiter.updateFromHeaders(response.headers);

      if (!response.ok) {
        console.error('X API error:', response.status, response.statusText);
        
        // Handle rate limiting
        if (response.status === 429) {
          const resetTime = response.headers.get('x-rate-limit-reset');
          const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : undefined;
          console.log('Rate limited. Reset time:', resetDate || 'unknown');
          await xApiRateLimiter.markRateLimited(resetDate);
        }
        
        throw new Error(`X API returned ${response.status}`);
      }

      const data = await response.json();
      console.log('X API response:', JSON.stringify(data, null, 2));

      // Handle both single tweet and array response
      let tweet;
      let includes;
      
      if (data.data && Array.isArray(data.data)) {
        // Array response from tweets endpoint
        if (data.data.length === 0) {
          console.log('No tweet data found');
          return null;
        }
        tweet = data.data[0];
        includes = data.includes;
      } else if (data.data) {
        // Single tweet response
        tweet = data.data;
        includes = data.includes;
      } else {
        console.log('Invalid response structure');
        return null;
      }
      
      console.log('Tweet created_at:', tweet.created_at);
      console.log('Media includes:', JSON.stringify(includes?.media, null, 2));

      const author = includes?.users?.[0];
      const media = includes?.media;

      // Build metadata object
      const metadata: Partial<ExtractedMetadata> = {
        content: tweet.text,
        author: author ? `${author.name} (@${author.username})` : undefined,
        username: author?.username,
        display_name: author?.name,
        profile_image: author?.profile_image_url,
        published_date: tweet.created_at,
        likes: tweet.public_metrics?.like_count,
        retweets: tweet.public_metrics?.retweet_count,
        replies: tweet.public_metrics?.reply_count,
        views: tweet.public_metrics?.impression_count,
        extra_data: {
          tweet_id: tweet.id,
          verified: author?.verified,
          quote_count: tweet.public_metrics?.quote_count,
          published_date: tweet.created_at,
        }
      };

      // Handle media attachments
      if (media && media.length > 0) {
        const firstMedia = media[0];
        
        if (firstMedia.type === 'photo') {
          metadata.thumbnail_url = firstMedia.url;
        } else if (firstMedia.type === 'video' || firstMedia.type === 'animated_gif') {
          metadata.thumbnail_url = firstMedia.preview_image_url;
          metadata.duration = firstMedia.duration_ms ? `${Math.round(firstMedia.duration_ms / 1000)}s` : undefined;
          
          // Store all video variants in extra_data
          metadata.extra_data = {
            ...metadata.extra_data,
            video_variants: firstMedia.variants,
            video_width: firstMedia.width,
            video_height: firstMedia.height,
            is_video: true,
            media_type: firstMedia.type
          };
          
          // Find the best quality video variant
          if (firstMedia.variants && firstMedia.variants.length > 0) {
            // First try to find MP4 variants with bitrate
            let mp4Variants = firstMedia.variants
              .filter(v => v.content_type === 'video/mp4' && v.bit_rate)
              .sort((a, b) => (b.bit_rate || 0) - (a.bit_rate || 0));
            
            // If no variants with bitrate, get all MP4 variants
            if (mp4Variants.length === 0) {
              mp4Variants = firstMedia.variants
                .filter(v => v.content_type === 'video/mp4');
            }
            
            if (mp4Variants.length > 0) {
              metadata.video_url = mp4Variants[0].url;
              metadata.video_type = mp4Variants[0].content_type;
              console.log('Selected video URL:', mp4Variants[0].url);
              console.log('Video type:', mp4Variants[0].content_type);
            } else {
              // Fallback to any video variant that's not m3u8
              const nonHlsVariant = firstMedia.variants?.find(v => 
                v.content_type !== 'application/x-mpegURL' && v.url
              );
              if (nonHlsVariant) {
                metadata.video_url = nonHlsVariant.url;
                metadata.video_type = nonHlsVariant.content_type;
                console.log('Using fallback video URL:', nonHlsVariant.url);
              }
            }
          }
        }
        
        // Handle multiple images
        if (media.length > 1 && media.every(m => m.type === 'photo')) {
          metadata.extra_data = {
            ...metadata.extra_data,
            additional_images: media.slice(1).map(m => m.url)
          };
        }
      }

      console.log('Extracted X API metadata:', {
        ...metadata,
        video_url: metadata.video_url,
        video_variants_count: metadata.extra_data?.video_variants?.length || 0
      });
      return metadata;

    } catch (error) {
      console.error('Failed to fetch tweet with X API:', error);
      return null;
    }
  }

  /**
   * Check if X API service is available
   */
  isAvailable(): boolean {
    const available = !!this.bearerToken;
    console.log('X API isAvailable check:', available, 'Bearer token length:', this.bearerToken.length);
    return available;
  }
}

// Create a getter that initializes the service lazily
let _instance: XApiService | null = null;

export const xApiService = {
  isAvailable(): boolean {
    if (!_instance) {
      _instance = new XApiService();
    }
    return _instance.isAvailable();
  },
  
  async fetchTweet(url: string) {
    if (!_instance) {
      _instance = new XApiService();
    }
    return _instance.fetchTweet(url);
  }
};