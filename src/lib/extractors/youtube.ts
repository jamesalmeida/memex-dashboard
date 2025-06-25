import { BaseExtractor, ExtractorOptions, ExtractorResult } from './base';
import { YouTubeMetadata } from '@/types/metadata';
import { detectContentType, extractPlatformId } from '@/lib/contentTypes/detector';

export class YouTubeExtractor extends BaseExtractor {
  constructor() {
    super('youtube');
  }
  
  canHandle(url: string): boolean {
    const detection = detectContentType(url);
    return detection.type === 'youtube';
  }
  
  async extract(options: ExtractorOptions): Promise<ExtractorResult> {
    const { url } = options;
    
    const html = options.html || await this.fetchHtml(url);
    const $ = options.$ || this.parseHtml(html);
    
    const metadata = await this.extractFromHtml($, url, html);
    
    return {
      metadata,
      confidence: 0.9,
      source: 'scraping',
    };
  }
  
  private async extractFromHtml($: cheerio.CheerioAPI, url: string, html: string): Promise<YouTubeMetadata> {
    const basicMetadata = this.extractBasicMetadata($, url);
    const ogData = this.extractOpenGraphData($);
    
    const videoId = extractPlatformId(url, 'youtube') || '';
    
    // Extract channel information
    let channelName = '';
    let channelUrl = '';
    
    // Try to extract from structured data
    const ldJson = $('script[type="application/ld+json"]').html();
    if (ldJson) {
      try {
        const data = JSON.parse(ldJson);
        if (data.author) {
          channelName = data.author.name || '';
          channelUrl = data.author.url || '';
        }
      } catch (e) {
        console.error('Failed to parse YouTube LD+JSON:', e);
      }
    }
    
    // Fallback to meta tags
    if (!channelName) {
      channelName = $('meta[itemprop="channelName"]').attr('content') || 
                   $('link[itemprop="name"]').attr('content') ||
                   ogData.site_name || '';
    }
    
    // Extract duration
    const duration = $('meta[itemprop="duration"]').attr('content') || '';
    
    // Check if it's a short
    const isShort = url.includes('/shorts/');
    
    // Extract channel ID from various sources
    const channelId = $('meta[itemprop="channelId"]').attr('content') || 
                     $('meta[property="og:channel"]').attr('content') || 
                     '';
    
    const metadata: YouTubeMetadata = {
      url,
      title: basicMetadata.title || '',
      contentType: 'youtube',
      category: 'media',
      extractedAt: new Date().toISOString(),
      videoId,
      channelId,
      channelName,
      channelUrl,
      duration,
      
      description: basicMetadata.description,
      thumbnail: basicMetadata.thumbnail,
      
      author: {
        name: channelName,
        profileUrl: channelUrl || undefined,
      },
      
      isShort,
      
      // YouTube API could provide transcript availability
      transcript: {
        available: false, // Would need API or additional parsing
      },
      
      publishedAt: basicMetadata.publishedAt,
    };
    
    // Extract engagement if available
    const viewsMatch = html.match(/"viewCount":\s*"(\d+)"/);
    if (viewsMatch) {
      metadata.engagement = {
        views: parseInt(viewsMatch[1]),
      };
    }
    
    return this.cleanMetadata(metadata) as YouTubeMetadata;
  }
}