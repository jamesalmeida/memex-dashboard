import { BaseExtractor, ExtractorOptions, ExtractorResult } from './base';
import { TwitterMetadata } from '@/types/metadata';
import { detectContentType, extractPlatformId } from '@/lib/contentTypes/detector';
import { xApiService } from '@/lib/services/xApiService';

export class TwitterExtractor extends BaseExtractor {
  constructor() {
    super('twitter');
  }
  
  canHandle(url: string): boolean {
    const detection = detectContentType(url);
    return detection.type === 'twitter';
  }
  
  async extract(options: ExtractorOptions): Promise<ExtractorResult> {
    const { url } = options;
    
    console.log('Twitter extractor: Starting extraction for', url);
    console.log('Twitter extractor: X API available?', xApiService.isAvailable());
    
    // Try X API first if available
    if (xApiService.isAvailable()) {
      console.log('Twitter extractor: Attempting X API extraction');
      try {
        const apiData = await xApiService.fetchTweet(url);
        
        if (apiData) {
          console.log('Twitter extractor: X API data received', apiData);
          const metadata = this.transformApiResponse(apiData, url);
          return {
            metadata,
            confidence: 1.0,
            source: 'api',
          };
        }
      } catch (error) {
        console.error('X API extraction failed:', error);
      }
    }
    
    // Fallback to HTML scraping
    const html = options.html || await this.fetchHtml(url);
    const $ = options.$ || this.parseHtml(html);
    
    const metadata = await this.extractFromHtml($, url, html);
    
    return {
      metadata,
      confidence: 0.7,
      source: 'scraping',
    };
  }
  
  private transformApiResponse(apiData: any, url: string): TwitterMetadata {
    const urlObj = new URL(url);
    const tweetId = extractPlatformId(url, 'twitter') || '';
    
    const metadata: TwitterMetadata = {
      url,
      title: apiData.content || '',
      contentType: 'twitter',
      category: 'social',
      extractedAt: new Date().toISOString(),
      tweetId,
      
      description: apiData.content,
      thumbnail: apiData.thumbnail_url,
      
      author: {
        name: apiData.display_name || apiData.author || '',
        username: apiData.username || apiData.author?.replace('@', '') || '',
        profileUrl: `https://x.com/${apiData.username || ''}`,
        profileImage: apiData.profile_image,
        verified: apiData.extra_data?.is_verified || false,
      },
      
      engagement: {
        likes: parseInt(apiData.likes || '0'),
        retweets: parseInt(apiData.retweets || '0'),
        replies: parseInt(apiData.replies || '0'),
        views: parseInt(apiData.views || '0'),
        quotes: parseInt(apiData.quotes || '0'),
      },
      
      publishedAt: apiData.published_date,
      
      postType: apiData.video_url ? 'video' : 'text',
      
      media: {
        images: apiData.thumbnail_url ? [{ url: apiData.thumbnail_url }] : [],
        videos: apiData.video_url ? [{
          url: apiData.video_url,
          thumbnail: apiData.thumbnail_url,
          format: apiData.video_type,
        }] : [],
      },
    };
    
    // Handle video variants from extra_data
    if (apiData.extra_data?.video_variants?.length > 0) {
      // Sort variants to prioritize MP4 over HLS
      const sortedVariants = [...apiData.extra_data.video_variants].sort((a: any, b: any) => {
        // MP4 comes first
        if (a.content_type === 'video/mp4' && b.content_type !== 'video/mp4') return -1;
        if (a.content_type !== 'video/mp4' && b.content_type === 'video/mp4') return 1;
        // Then by bitrate if both are same type
        return (b.bit_rate || 0) - (a.bit_rate || 0);
      });
      
      metadata.media!.videos = sortedVariants.map((variant: any) => ({
        url: variant.url,
        format: variant.content_type,
        thumbnail: apiData.thumbnail_url,
      }));
    }
    
    return this.cleanMetadata(metadata) as TwitterMetadata;
  }
  
  private async extractFromHtml($: cheerio.CheerioAPI, url: string, html: string): Promise<TwitterMetadata> {
    const basicMetadata = this.extractBasicMetadata($, url);
    const ogData = this.extractOpenGraphData($);
    const twitterData = this.extractTwitterCardData($);
    
    const tweetId = extractPlatformId(url, 'twitter') || '';
    
    // Extract title and content
    let title = basicMetadata.title || '';
    let content = basicMetadata.description || '';
    
    // For Twitter, the description often contains the actual tweet content
    if (content && !title.includes(content)) {
      title = content;
    }
    
    // Extract author information
    const authorMatch = title.match(/^(.+?)\s+\(@(\w+)\)\s+on\s+(?:Twitter|X)/);
    let displayName = '';
    let username = '';
    
    if (authorMatch) {
      displayName = authorMatch[1].trim();
      username = authorMatch[2];
    } else {
      // Try to extract from URL
      const urlMatch = url.match(/(?:twitter|x)\.com\/(\w+)\/status/);
      if (urlMatch) {
        username = urlMatch[1];
      }
    }
    
    // Extract engagement metrics
    const engagement: any = {};
    if (twitterData.data1) {
      engagement.likes = parseInt(twitterData.data1.replace(/[^\d]/g, '') || '0');
    }
    if (twitterData.data2) {
      engagement.retweets = parseInt(twitterData.data2.replace(/[^\d]/g, '') || '0');
    }
    
    // Check for video content
    const isVideo = twitterData.card === 'player' || twitterData.card === 'amplify' || !!ogData.video;
    
    // Extract video URLs from HTML
    const videoUrls: string[] = [];
    const videoPatterns = [
      /https:\/\/video\.twimg\.com\/[^"'\s]+\.mp4/g,
      /https:\/\/video\.twimg\.com\/amplify_video\/[^"'\s]+\.mp4/g,
      /https:\/\/video\.twimg\.com\/ext_tw_video\/[^"'\s]+\.mp4/g,
    ];
    
    videoPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(url => videoUrls.push(url));
      }
    });
    
    const metadata: TwitterMetadata = {
      url,
      title,
      contentType: 'twitter',
      category: 'social',
      extractedAt: new Date().toISOString(),
      tweetId,
      
      description: content,
      thumbnail: basicMetadata.thumbnail,
      
      author: {
        name: displayName || username,
        username,
        profileUrl: username ? `https://x.com/${username}` : undefined,
        profileImage: ogData.image?.includes('profile_images') ? ogData.image : undefined,
      },
      
      engagement,
      
      postType: isVideo ? 'video' : basicMetadata.thumbnail ? 'image' : 'text',
      
      media: {
        images: basicMetadata.thumbnail && !isVideo ? [{ url: basicMetadata.thumbnail }] : [],
        videos: videoUrls.length > 0 ? videoUrls.map(url => ({ url })) : [],
      },
    };
    
    return this.cleanMetadata(metadata) as TwitterMetadata;
  }
}