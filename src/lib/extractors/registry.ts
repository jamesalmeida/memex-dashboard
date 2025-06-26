import { BaseExtractor, ExtractorOptions, ExtractorResult } from './base';
import { TwitterExtractor } from './twitter';
import { InstagramExtractor } from './instagram';
import { YouTubeExtractor } from './youtube';
import { ArticleExtractor } from './article';
import { ProductExtractor } from './product';
import { detectContentType } from '@/lib/contentTypes/detector';
import { ContentMetadata } from '@/types/metadata';

/**
 * Registry for all content extractors
 */
class ExtractorRegistry {
  private extractors: BaseExtractor[] = [];
  
  constructor() {
    // Register all extractors
    this.register(new TwitterExtractor());
    this.register(new InstagramExtractor());
    this.register(new YouTubeExtractor());
    this.register(new ProductExtractor());
    this.register(new ArticleExtractor()); // Fallback extractor
  }
  
  /**
   * Register a new extractor
   */
  register(extractor: BaseExtractor): void {
    this.extractors.push(extractor);
    // Sort by priority (highest first)
    this.extractors.sort((a, b) => b.getPriority() - a.getPriority());
  }
  
  /**
   * Find the best extractor for a URL
   */
  findExtractor(url: string): BaseExtractor | null {
    // Find all extractors that can handle this URL
    const candidates = this.extractors.filter(e => e.canHandle(url));
    
    // Return the highest priority one
    return candidates[0] || null;
  }
  
  /**
   * Extract metadata from a URL
   */
  async extract(url: string, options?: Partial<ExtractorOptions>): Promise<ExtractorResult> {
    let extractor = this.findExtractor(url);
    
    if (!extractor) {
      // No specific extractor found, try to detect from HTML/OpenGraph
      const html = options?.html || await this.fetchHtml(url);
      const $ = this.parseHtml(html);
      
      // Check og:type for content type hints
      const ogType = $('meta[property="og:type"]').attr('content')?.toLowerCase();
      
      // Check for product-specific OpenGraph tags
      const hasProductTags = $('meta[property^="product:"]').length > 0;
      
      if (hasProductTags || ogType === 'product' || ogType === 'og:product') {
        // Use ProductExtractor for items with product metadata
        extractor = this.extractors.find(e => e.constructor.name === 'ProductExtractor') || null;
      }
      
      if (!extractor) {
        // Still no extractor, use generic detection
        const detection = detectContentType(url);
        
        return {
          metadata: {
            url,
            title: 'Unknown Content',
            contentType: detection.type,
            category: detection.category,
            extractedAt: new Date().toISOString(),
          } as ContentMetadata,
          confidence: 0.1,
          source: 'scraping',
        };
      }
      
      // Pass the already fetched HTML to avoid duplicate requests
      return extractor.extract({ url, html, $, ...options });
    }
    
    return extractor.extract({ url, ...options });
  }
  
  /**
   * Helper method to fetch HTML
   */
  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MemexBot/1.0; +https://memex.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.text();
  }
  
  /**
   * Helper method to parse HTML
   */
  private parseHtml(html: string): cheerio.CheerioAPI {
    const cheerio = require('cheerio');
    return cheerio.load(html);
  }
  
  /**
   * Extract metadata with caching support
   */
  async extractWithCache(
    url: string, 
    options?: Partial<ExtractorOptions>
  ): Promise<ExtractorResult> {
    // Check localStorage cache first
    const cacheKey = `metadata:${url}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached && !this.isCacheExpired(cached)) {
      return {
        metadata: cached.metadata,
        confidence: cached.confidence,
        source: 'hybrid', // Indicates cached data
      };
    }
    
    // Extract fresh data
    const result = await this.extract(url, options);
    
    // Cache the result
    this.saveToCache(cacheKey, result);
    
    return result;
  }
  
  private getFromCache(key: string): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }
  
  private saveToCache(key: string, data: ExtractorResult): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = {
        ...data,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (e) {
      // Handle quota exceeded
      console.warn('Failed to cache metadata:', e);
    }
  }
  
  private isCacheExpired(cached: any): boolean {
    if (!cached.cachedAt) return true;
    
    const cacheAge = Date.now() - new Date(cached.cachedAt).getTime();
    
    // Different cache durations based on content type
    let maxAge = 24 * 60 * 60 * 1000; // Default: 24 hours
    
    if (cached.metadata?.contentType) {
      switch (cached.metadata.contentType) {
        case 'twitter':
        case 'instagram':
        case 'tiktok':
        case 'reddit':
          maxAge = 6 * 60 * 60 * 1000; // 6 hours for social media
          break;
        case 'youtube':
          maxAge = 12 * 60 * 60 * 1000; // 12 hours for YouTube
          break;
        case 'article':
        case 'product':
          maxAge = 48 * 60 * 60 * 1000; // 48 hours for articles/products
          break;
      }
    }
    
    return cacheAge > maxAge;
  }
  
  /**
   * Clear cache for a specific URL or all URLs
   */
  clearCache(url?: string): void {
    if (typeof window === 'undefined') return;
    
    if (url) {
      localStorage.removeItem(`metadata:${url}`);
    } else {
      // Clear all metadata cache
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('metadata:')) {
          localStorage.removeItem(key);
        }
      });
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { total: number; expired: number; size: number } {
    if (typeof window === 'undefined') {
      return { total: 0, expired: 0, size: 0 };
    }
    
    let total = 0;
    let expired = 0;
    let size = 0;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('metadata:')) {
        total++;
        const value = localStorage.getItem(key);
        if (value) {
          size += value.length;
          try {
            const cached = JSON.parse(value);
            if (this.isCacheExpired(cached)) {
              expired++;
            }
          } catch {
            // Invalid cache entry
            expired++;
          }
        }
      }
    });
    
    return { total, expired, size };
  }
  
  /**
   * Clean expired cache entries
   */
  cleanExpiredCache(): number {
    if (typeof window === 'undefined') return 0;
    
    let cleaned = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('metadata:')) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const cached = JSON.parse(value);
            if (this.isCacheExpired(cached)) {
              localStorage.removeItem(key);
              cleaned++;
            }
          } catch {
            // Invalid cache entry, remove it
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      }
    });
    
    return cleaned;
  }
}

// Export singleton instance
export const extractorRegistry = new ExtractorRegistry();