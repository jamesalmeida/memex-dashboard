import { BaseMetadata, ContentMetadata } from '@/types/metadata';
import { ContentType } from '@/lib/contentTypes/patterns';
import * as cheerio from 'cheerio';

export interface ExtractorOptions {
  url: string;
  html?: string;
  $?: cheerio.CheerioAPI;
  timeout?: number;
}

export interface ExtractorResult {
  metadata: ContentMetadata;
  confidence: number;
  source: 'api' | 'scraping' | 'hybrid';
}

/**
 * Base class for all content extractors
 */
export abstract class BaseExtractor {
  protected contentType: ContentType;
  protected requiresAuth: boolean = false;
  
  constructor(contentType: ContentType) {
    this.contentType = contentType;
  }
  
  /**
   * Extract metadata from content
   */
  abstract extract(options: ExtractorOptions): Promise<ExtractorResult>;
  
  /**
   * Validate if this extractor can handle the given URL
   */
  abstract canHandle(url: string): boolean;
  
  /**
   * Get priority for this extractor (higher = preferred)
   */
  getPriority(): number {
    return 1;
  }
  
  /**
   * Common HTML fetching logic
   */
  protected async fetchHtml(url: string, customHeaders?: Record<string, string>): Promise<string> {
    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (compatible; MemexBot/1.0; +https://memex.com/bot)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };
    
    const headers = { ...defaultHeaders, ...customHeaders };
    
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.text();
  }
  
  /**
   * Parse HTML with Cheerio
   */
  protected parseHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }
  
  /**
   * Extract common Open Graph metadata
   */
  protected extractOpenGraphData($: cheerio.CheerioAPI): Record<string, any> {
    const ogData: Record<string, any> = {};
    
    $('meta[property^="og:"]').each((_, elem) => {
      const property = $(elem).attr('property');
      const content = $(elem).attr('content');
      
      if (property && content) {
        const parts = property.split(':');
        if (parts.length === 2) {
          ogData[parts[1]] = content;
        } else if (parts.length > 2) {
          // Handle nested properties
          let current = ogData;
          for (let i = 1; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            if (typeof current[parts[i]] === 'string') {
              current[parts[i]] = { _value: current[parts[i]] };
            }
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = content;
        }
      }
    });
    
    return ogData;
  }
  
  /**
   * Extract Twitter Card metadata
   */
  protected extractTwitterCardData($: cheerio.CheerioAPI): Record<string, any> {
    const twitterData: Record<string, any> = {};
    
    $('meta[name^="twitter:"]').each((_, elem) => {
      const name = $(elem).attr('name');
      const content = $(elem).attr('content');
      
      if (name && content) {
        const parts = name.split(':');
        if (parts.length === 2) {
          twitterData[parts[1]] = content;
        } else if (parts.length > 2) {
          let current = twitterData;
          for (let i = 1; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = content;
        }
      }
    });
    
    return twitterData;
  }
  
  /**
   * Extract basic metadata from HTML
   */
  protected extractBasicMetadata($: cheerio.CheerioAPI, url: string): Partial<BaseMetadata> {
    const urlObj = new URL(url);
    
    return {
      url,
      title: this.extractTitle($),
      description: this.extractDescription($),
      thumbnail: this.extractThumbnail($),
      favicon: this.extractFavicon($, urlObj.origin),
      siteName: $('meta[property="og:site_name"]').attr('content') || urlObj.hostname,
      publishedAt: this.extractPublishedDate($),
      author: this.extractAuthor($),
    };
  }
  
  private extractTitle($: cheerio.CheerioAPI): string {
    return (
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      $('h1').first().text().trim() ||
      'Untitled'
    );
  }
  
  private extractDescription($: cheerio.CheerioAPI): string | undefined {
    return (
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[itemprop="description"]').attr('content')
    );
  }
  
  private extractThumbnail($: cheerio.CheerioAPI): string | undefined {
    return (
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[itemprop="image"]').attr('content')
    );
  }
  
  private extractFavicon($: cheerio.CheerioAPI, origin: string): string | undefined {
    const favicon = (
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href')
    );
    
    if (favicon) {
      try {
        return new URL(favicon, origin).href;
      } catch {
        return undefined;
      }
    }
    
    return undefined;
  }
  
  private extractPublishedDate($: cheerio.CheerioAPI): string | undefined {
    return (
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[property="og:updated_time"]').attr('content') ||
      $('time[datetime]').attr('datetime')
    );
  }
  
  private extractAuthor($: cheerio.CheerioAPI): { name: string } | undefined {
    const authorName = (
      $('meta[property="article:author"]').attr('content') ||
      $('meta[name="author"]').attr('content') ||
      $('meta[name="twitter:creator"]').attr('content')
    );
    
    return authorName ? { name: authorName } : undefined;
  }
  
  /**
   * Clean and validate metadata
   */
  protected cleanMetadata(metadata: any): ContentMetadata {
    // Remove empty values
    const cleaned = Object.fromEntries(
      Object.entries(metadata).filter(([_, value]) => {
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'string' && !value.trim()) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'object' && Object.keys(value).length === 0) return false;
        return true;
      })
    );
    
    // Ensure required fields
    cleaned.url = cleaned.url || metadata.url;
    cleaned.title = cleaned.title || 'Untitled';
    cleaned.contentType = this.contentType;
    cleaned.extractedAt = new Date().toISOString();
    
    return cleaned as ContentMetadata;
  }
}