import { ExtractedMetadata } from './urlMetadata';

interface JinaReaderResponse {
  code: number;
  status: number;
  data: {
    title: string;
    description: string;
    content: string;
    url: string;
    images?: string[];
    publishedTime?: string;
    author?: string;
    siteName?: string;
    favicon?: string;
    lang?: string;
    categories?: string[];
  };
}

export class JinaService {
  private apiKey: string;
  private baseUrl = 'https://r.jina.ai/';

  constructor() {
    this.apiKey = process.env.JINA_AI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Jina AI API key not found in environment variables');
    }
  }

  /**
   * Extract content and metadata from a URL using Jina Reader API
   */
  async extractContent(url: string): Promise<Partial<ExtractedMetadata> | null> {
    if (!this.apiKey) {
      console.log('Jina API key not available, skipping Jina extraction');
      return null;
    }

    console.log('=== JinaService: Extracting content for:', url);

    try {
      // Jina Reader API accepts URLs by prepending them to the base URL
      const jinaUrl = `${this.baseUrl}${encodeURIComponent(url)}`;
      
      const response = await fetch(jinaUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'X-With-Images-Summary': 'true',
          'X-With-Links-Summary': 'true',
        }
      });

      if (!response.ok) {
        console.error('Jina API error:', response.status, response.statusText);
        
        // If we get a 422 (Unprocessable Entity), it might be a PDF or unsupported content
        if (response.status === 422) {
          console.log('Content type not supported by Jina Reader');
          return null;
        }
        
        throw new Error(`Jina API returned ${response.status}`);
      }

      const data = await response.json() as JinaReaderResponse;
      console.log('Jina API response:', {
        title: data.data.title,
        hasContent: !!data.data.content,
        contentLength: data.data.content?.length,
        hasImages: !!(data.data.images && data.data.images.length > 0)
      });

      // Convert Jina response to our ExtractedMetadata format
      const metadata: Partial<ExtractedMetadata> = {
        title: data.data.title || '',
        description: data.data.description || '',
        content: data.data.content || '',  // Store full content in content field
        // Also keep in extra_data for backward compatibility
        extra_data: {
          content: data.data.content,
          categories: data.data.categories,
          lang: data.data.lang,
          siteName: data.data.siteName
        }
      };

      // Add thumbnail if images are available
      if (data.data.images && data.data.images.length > 0) {
        metadata.thumbnail_url = data.data.images[0];
      }

      // Add author if available
      if (data.data.author) {
        metadata.author = data.data.author;
      }

      // Add published date if available
      if (data.data.publishedTime) {
        metadata.published_date = data.data.publishedTime;
      }

      console.log('Extracted metadata from Jina:', metadata);
      return metadata;

    } catch (error) {
      console.error('Failed to extract content with Jina:', error);
      return null;
    }
  }

  /**
   * Check if Jina service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Extract clean text content for AI processing
   */
  async extractCleanText(url: string): Promise<string | null> {
    const metadata = await this.extractContent(url);
    return metadata?.extra_data?.content || null;
  }
}

// Export singleton instance
export const jinaService = new JinaService();