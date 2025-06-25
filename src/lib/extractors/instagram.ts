import { BaseExtractor, ExtractorOptions, ExtractorResult } from './base';
import { InstagramMetadata, MediaItem } from '@/types/metadata';
import { detectContentType, extractPlatformId } from '@/lib/contentTypes/detector';

export class InstagramExtractor extends BaseExtractor {
  constructor() {
    super('instagram');
  }
  
  canHandle(url: string): boolean {
    const detection = detectContentType(url);
    return detection.type === 'instagram';
  }
  
  async extract(options: ExtractorOptions): Promise<ExtractorResult> {
    const { url } = options;
    
    // Use browser-like headers for Instagram
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1'
    };
    
    const html = options.html || await this.fetchHtml(url, headers);
    const $ = options.$ || this.parseHtml(html);
    
    const metadata = await this.extractFromHtml($, url, html);
    
    return {
      metadata,
      confidence: 0.8,
      source: 'scraping',
    };
  }
  
  private async extractFromHtml($: cheerio.CheerioAPI, url: string, html: string): Promise<InstagramMetadata> {
    const basicMetadata = this.extractBasicMetadata($, url);
    const ogData = this.extractOpenGraphData($);
    
    const postId = extractPlatformId(url, 'instagram') || '';
    const urlObj = new URL(url);
    
    // Extract post content from title
    let postContent = '';
    let username = '';
    let engagement: any = {};
    
    const title = ogData.title || basicMetadata.title || '';
    
    // New format: "52K likes, 353 comments - iamthirtyaf on June 13, 2025: \"post content\""
    const engagementMatch = title.match(/^([\d,K]+)\s+likes?,\s*([\d,K]+)\s+comments?\s*-\s*([^\s]+)\s+on\s+(.+?):\s*"?(.+?)"?$/);
    
    if (engagementMatch) {
      // Extract engagement metrics
      let likes = engagementMatch[1].replace(/,/g, '');
      if (likes.includes('K')) {
        likes = (parseFloat(likes.replace('K', '')) * 1000).toString();
      }
      engagement.likes = parseInt(likes);
      
      let comments = engagementMatch[2].replace(/,/g, '');
      if (comments.includes('K')) {
        comments = (parseFloat(comments.replace('K', '')) * 1000).toString();
      }
      engagement.comments = parseInt(comments);
      
      username = engagementMatch[3];
      engagement.post_date = engagementMatch[4];
      postContent = engagementMatch[5].replace(/^["']|["']$/g, '').trim();
    } else {
      // Try alternative formats
      const usernameMatch = title.match(/^(.+?)\s+on\s+Instagram/);
      if (usernameMatch) {
        username = usernameMatch[1].replace(/^@/, '');
      }
      
      // Use description as content if available
      postContent = basicMetadata.description || title;
    }
    
    // Determine post type
    let postType: 'post' | 'reel' | 'story' | 'igtv' = 'post';
    const hasVideo = !!ogData.video || !!ogData.video?.url;
    
    if (urlObj.pathname.includes('/reel/')) {
      postType = 'reel';
    } else if (urlObj.pathname.includes('/tv/')) {
      postType = 'igtv';
    } else if (urlObj.pathname.includes('/stories/')) {
      postType = 'story';
    }
    
    // Extract all images
    const images: MediaItem[] = [];
    $('meta[property="og:image"]').each((_, elem) => {
      const imageUrl = $(elem).attr('content');
      if (imageUrl) {
        images.push({ url: imageUrl });
      }
    });
    
    // Determine if it's a carousel
    const isCarousel = images.length > 1 || 
                      html.includes('carousel') || 
                      (basicMetadata.description?.includes('photos and videos') || false);
    
    const metadata: InstagramMetadata = {
      url,
      title: postContent || `Instagram ${postType} by @${username}`,
      contentType: 'instagram',
      category: 'social',
      extractedAt: new Date().toISOString(),
      postId,
      postType,
      
      description: postContent,
      thumbnail: images[0]?.url || basicMetadata.thumbnail,
      
      author: {
        name: username,
        username,
        profileUrl: username ? `https://instagram.com/${username}` : undefined,
      },
      
      engagement,
      
      caption: postContent,
      
      media: {
        images: hasVideo ? [] : images,
        videos: hasVideo ? [{
          url: ogData.video?.url || ogData.video?.secure_url || '',
          thumbnail: basicMetadata.thumbnail,
          format: ogData.video?.type,
        }] : [],
      },
      
      carousel: isCarousel && !hasVideo ? images : undefined,
    };
    
    return this.cleanMetadata(metadata) as InstagramMetadata;
  }
}