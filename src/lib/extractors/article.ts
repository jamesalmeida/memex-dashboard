import { BaseExtractor, ExtractorOptions, ExtractorResult } from './base';
import { ArticleMetadata } from '@/types/metadata';
import { jinaService } from '@/lib/services/jinaService';

export class ArticleExtractor extends BaseExtractor {
  constructor() {
    super('article');
  }
  
  canHandle(url: string): boolean {
    // This is a fallback extractor for general web articles
    try {
      const urlObj = new URL(url);
      return urlObj.protocol.startsWith('http');
    } catch {
      return false;
    }
  }
  
  getPriority(): number {
    // Lower priority as this is a fallback
    return 0;
  }
  
  async extract(options: ExtractorOptions): Promise<ExtractorResult> {
    const { url } = options;
    
    // Try Jina Reader API first for articles
    if (jinaService.isAvailable()) {
      try {
        const jinaData = await jinaService.extractContent(url);
        
        if (jinaData) {
          const metadata = this.transformJinaResponse(jinaData, url);
          return {
            metadata,
            confidence: 0.9,
            source: 'api',
          };
        }
      } catch (error) {
        console.error('Jina extraction failed:', error);
      }
    }
    
    // Fallback to HTML scraping
    const html = options.html || await this.fetchHtml(url);
    const $ = options.$ || this.parseHtml(html);
    
    const metadata = await this.extractFromHtml($, url, html);
    
    return {
      metadata,
      confidence: 0.6,
      source: 'scraping',
    };
  }
  
  private transformJinaResponse(jinaData: any, url: string): ArticleMetadata {
    const urlObj = new URL(url);
    
    const metadata: ArticleMetadata = {
      url,
      title: jinaData.title || 'Untitled Article',
      contentType: 'article',
      category: 'article',
      extractedAt: new Date().toISOString(),
      
      description: jinaData.description,
      thumbnail: jinaData.thumbnail_url,
      siteName: jinaData.domain || urlObj.hostname,
      
      author: jinaData.author ? { name: jinaData.author } : undefined,
      
      excerpt: jinaData.description || jinaData.content?.substring(0, 200),
      
      publication: {
        name: jinaData.domain || urlObj.hostname,
        url: urlObj.origin,
      },
    };
    
    // Estimate word count and reading time if content is available
    if (jinaData.content) {
      const words = jinaData.content.split(/\s+/).length;
      metadata.wordCount = words;
      metadata.readingTime = Math.ceil(words / 200); // Average reading speed
    }
    
    return this.cleanMetadata(metadata) as ArticleMetadata;
  }
  
  private async extractFromHtml($: cheerio.CheerioAPI, url: string, html: string): Promise<ArticleMetadata> {
    const basicMetadata = this.extractBasicMetadata($, url);
    const ogData = this.extractOpenGraphData($);
    const urlObj = new URL(url);
    
    // Extract article content for word count
    const articleContent = $('article').text() || 
                         $('main').text() || 
                         $('[role="main"]').text() || 
                         $('body').text();
    
    const words = articleContent.split(/\s+/).filter(w => w.length > 0).length;
    
    const metadata: ArticleMetadata = {
      url,
      title: basicMetadata.title || 'Untitled Article',
      contentType: 'article',
      category: 'article',
      extractedAt: new Date().toISOString(),
      
      description: basicMetadata.description,
      thumbnail: basicMetadata.thumbnail,
      siteName: basicMetadata.siteName,
      
      author: basicMetadata.author,
      
      excerpt: basicMetadata.description || articleContent.substring(0, 200).trim(),
      
      wordCount: words,
      readingTime: Math.ceil(words / 200),
      
      publication: {
        name: basicMetadata.siteName || urlObj.hostname,
        url: urlObj.origin,
        logo: basicMetadata.favicon,
      },
      
      publishedAt: basicMetadata.publishedAt,
    };
    
    // Extract sections/headings
    const sections: Array<{ title: string; level: number }> = [];
    $('h1, h2, h3').each((_, elem) => {
      const $elem = $(elem);
      const title = $elem.text().trim();
      const level = parseInt(elem.tagName.substring(1));
      
      if (title) {
        sections.push({ title, level });
      }
    });
    
    if (sections.length > 0) {
      metadata.sections = sections;
    }
    
    return this.cleanMetadata(metadata) as ArticleMetadata;
  }
}