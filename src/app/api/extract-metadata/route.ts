import { NextRequest, NextResponse } from 'next/server';
import { extractorRegistry } from '@/lib/extractors/registry';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    console.log('=== Metadata Extraction API ===');
    console.log('URL:', url);
    console.log('Environment:', typeof window === 'undefined' ? 'server' : 'browser');
    console.log('X_BEARER_TOKEN available:', !!process.env.X_BEARER_TOKEN);
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Use the extractor registry to extract metadata
    const result = await extractorRegistry.extract(url);
    
    console.log('Extraction result:', {
      contentType: result.metadata.contentType,
      confidence: result.confidence,
      source: result.source,
    });
    
    // Transform metadata to match existing API response format
    const response = transformMetadataForLegacyAPI(result.metadata);
    
    console.log('Transformed response:', JSON.stringify(response, null, 2));
    console.log('=== Metadata Extraction Complete ===');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error extracting metadata:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * Transform new metadata format to match existing API response
 * This ensures backward compatibility while we refactor
 */
function transformMetadataForLegacyAPI(metadata: any): any {
  const response: any = {
    title: metadata.title || '',
    description: metadata.description || '',
    thumbnail_url: metadata.thumbnail || '',
    video_url: metadata.media?.videos?.[0]?.url || '',
    author: metadata.author?.name || '',
    domain: new URL(metadata.url).hostname,
  };
  
  // Content type specific transformations
  switch (metadata.contentType) {
    case 'twitter':
      response.content = metadata.description || metadata.title;
      response.username = metadata.author?.username;
      response.display_name = metadata.author?.name;
      response.profile_image = metadata.author?.profileImage;
      response.likes = metadata.engagement?.likes?.toString();
      response.retweets = metadata.engagement?.retweets?.toString();
      response.replies = metadata.engagement?.replies?.toString();
      response.views = metadata.engagement?.views?.toString();
      response.published_date = metadata.publishedAt;
      
      // Add video variants if available
      if (metadata.media?.videos?.length > 0) {
        response.extra_data = {
          video_variants: metadata.media.videos,
        };
      }
      break;
      
    case 'instagram':
      response.instagram_username = metadata.author?.username;
      response.instagram_post_type = metadata.postType;
      response.instagram_images = metadata.carousel?.map((img: any) => img.url) || 
                                 (metadata.media?.images?.map((img: any) => img.url) || []);
      response.instagram_engagement = {
        likes: metadata.engagement?.likes,
        comments: metadata.engagement?.comments,
        username: metadata.author?.username,
        scraped_at: metadata.extractedAt,
      };
      
      if (metadata.caption) {
        response.title = metadata.caption;
      }
      break;
      
    case 'youtube':
      response.duration = metadata.duration;
      response.channel_name = metadata.channelName;
      response.channel_url = metadata.channelUrl;
      response.video_id = metadata.videoId;
      break;
      
    case 'article':
      response.word_count = metadata.wordCount;
      response.reading_time = metadata.readingTime;
      response.published_date = metadata.publishedAt;
      break;
  }
  
  // Add common fields
  response.og_type = metadata.contentType;
  response.og_url = metadata.url;
  response.extracted_at = metadata.extractedAt;
  
  // Clean up response
  return Object.fromEntries(
    Object.entries(response).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  );
}