import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { ContentType } from '@/types/database';

// Simple content type detection based on URL patterns
function detectContentType(url: string): ContentType {
  const urlLower = url.toLowerCase();
  
  // YouTube
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  }
  
  // X/Twitter
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'x';
  }
  
  // GitHub
  if (urlLower.includes('github.com')) {
    return 'github';
  }
  
  // Instagram
  if (urlLower.includes('instagram.com')) {
    return 'instagram';
  }
  
  // TikTok
  if (urlLower.includes('tiktok.com')) {
    return 'tiktok';
  }
  
  // Reddit
  if (urlLower.includes('reddit.com')) {
    return 'reddit';
  }
  
  // Amazon
  if (urlLower.includes('amazon.com')) {
    return 'amazon';
  }
  
  // LinkedIn
  if (urlLower.includes('linkedin.com')) {
    return 'linkedin';
  }
  
  // Default
  return 'bookmark';
}

export async function POST(request: Request) {
  try {
    // Get user ID from header (sent by extension)
    const userIdFromHeader = request.headers.get('X-User-ID');
    
    if (!userIdFromHeader) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Use the service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body = await request.json();
    const { url, title, selection } = body;

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    // Simple content type detection
    const contentType = detectContentType(url);
    console.log('Chrome Extension: Detected content type:', contentType, 'for URL:', url);

    // Extract domain from URL
    let domain = '';
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
    } catch (e) {
      console.error('Invalid URL:', url);
    }

    // For YouTube and X content, fetch rich metadata before saving
    let enrichedData: any = {};
    const baseUrl = request.headers.get('origin') || `http://localhost:${process.env.PORT || 3000}`;
    
    if (contentType === 'youtube') {
      try {
        console.log('Chrome Extension: Fetching YouTube metadata before save...');
        
        const youtubeResponse = await fetch(`${baseUrl}/api/youtube-metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url })
        });
        
        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          console.log('YouTube API response:', youtubeData);
          
          if (youtubeData.success && youtubeData.metadata) {
            const ytMeta = youtubeData.metadata;
            
            // Enrich the item data with YouTube metadata
            enrichedData = {
              title: ytMeta.title || title,
              description: ytMeta.description || selection?.substring(0, 200) || null,
              thumbnail_url: ytMeta.thumbnails?.maxres || ytMeta.thumbnails?.high || ytMeta.thumbnails?.default || null,
            };
            
            // Prepare metadata for item_metadata table
            enrichedData.metadata = {
              domain: 'youtube.com',
              author: ytMeta.channel?.name || '',
              profile_image: ytMeta.channel?.avatar || '',
              views: ytMeta.view_count,
              likes: ytMeta.like_count,
              duration: ytMeta.duration,
              published_date: ytMeta.upload_date,
              extra_data: {
                video_id: ytMeta.id || url.match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1],
                channel_id: ytMeta.channel?.id,
                channel_url: ytMeta.channel?.url,
                subscriber_count: ytMeta.channel?.subscriber_count,
                category: ytMeta.category,
                tags: ytMeta.tags,
                is_live: ytMeta.is_live,
                is_upcoming: ytMeta.is_upcoming,
                thumbnails: ytMeta.thumbnails
              }
            };
            
            console.log('Successfully enriched with YouTube metadata');
          }
        } else {
          console.error('YouTube metadata API failed:', await youtubeResponse.text());
        }
      } catch (error) {
        console.error('Error fetching YouTube metadata:', error);
        // Continue with basic save if YouTube metadata fails
      }
    } else if (contentType === 'x') {
      // For X/Twitter content, use extract-metadata which handles X API
      try {
        console.log('Chrome Extension: Fetching X/Twitter metadata before save...');
        
        const xResponse = await fetch(`${baseUrl}/api/extract-metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url })
        });
        
        if (xResponse.ok) {
          const xData = await xResponse.json();
          console.log('X/Twitter metadata response:', xData);
          
          // Check if we got X API data (has video_url or engagement metrics)
          if (xData.video_url || xData.likes !== undefined || xData.views !== undefined) {
            // Enrich with X API data
            enrichedData = {
              title: '', // X posts don't use title
              content: xData.content || selection || '',
              description: xData.description || xData.content?.substring(0, 200) || null,
              thumbnail_url: xData.thumbnail_url || null,
            };
            
            // Prepare metadata for item_metadata table
            // Find the best MP4 video URL if video_variants exist
            let videoUrl = xData.video_url || '';
            if (xData.extra_data?.video_variants?.length > 0) {
              const mp4Variants = xData.extra_data.video_variants
                .filter((v: any) => v.format === 'video/mp4' || v.content_type === 'video/mp4')
                .filter((v: any) => v.url && !v.url.includes('.m3u8'));
              
              if (mp4Variants.length > 0) {
                videoUrl = mp4Variants[0].url;
                console.log('Chrome Extension: Selected MP4 video URL:', videoUrl);
              }
            }
            
            enrichedData.metadata = {
              domain: xData.domain || domain,
              author: xData.author || '',
              username: xData.username || '',
              profile_image: xData.profile_image || '',
              video_url: videoUrl,
              likes: xData.likes,
              retweets: xData.retweets,
              replies: xData.replies,
              views: xData.views,
              published_date: xData.published_date || '',
              extra_data: {
                ...xData.extra_data,
                display_name: xData.display_name || ''
              }
            };
            
            console.log('Successfully enriched with X/Twitter metadata');
          }
        } else {
          console.error('X/Twitter metadata API failed:', await xResponse.text());
        }
      } catch (error) {
        console.error('Error fetching X/Twitter metadata:', error);
        // Continue with basic save if X metadata fails
      }
    }

    // Create item data matching the items table schema
    const itemData = {
      user_id: userIdFromHeader,
      title: enrichedData.title !== undefined ? enrichedData.title : title,
      url: url,
      content_type: contentType,
      content: enrichedData.content || selection || '',
      description: enrichedData.description || (selection ? selection.substring(0, 200) : null),
      thumbnail_url: enrichedData.thumbnail_url || null,
      raw_text: enrichedData.content || selection || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Chrome Extension: Saving item with data:', itemData);

    const { data, error } = await supabase
      .from('items')
      .insert(itemData)
      .select()
      .single();

    if (error) {
      console.error('Error saving item:', error);
      return NextResponse.json(
        { error: 'Failed to save item' },
        { status: 500 }
      );
    }

    // Save enriched metadata if we have it (YouTube or X)
    if (data && enrichedData.metadata) {
      try {
        console.log(`Chrome Extension: Saving ${contentType} metadata...`);
        const { error: metadataError } = await supabase
          .from('item_metadata')
          .insert({
            item_id: data.id,
            ...enrichedData.metadata
          });
        
        if (metadataError) {
          console.error(`Error saving ${contentType} metadata:`, metadataError);
          // Don't fail the main request if metadata save fails
        } else {
          console.log(`Successfully saved ${contentType} metadata`);
        }
      } catch (metaError) {
        console.error('Error saving metadata:', metaError);
      }
    }

    // After successfully saving the item, trigger metadata refresh for content without enriched metadata
    // Skip if we already fetched metadata for YouTube or X
    if (data && data.id && !enrichedData.metadata) {
      try {
        console.log('Chrome Extension: Triggering metadata refresh for item:', data.id);
        
        // Call the refresh-metadata endpoint
        const baseUrl = request.headers.get('origin') || `http://localhost:${process.env.PORT || 3000}`;
        const refreshResponse = await fetch(`${baseUrl}/api/refresh-metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId: data.id,
            url: data.url,
            contentType: data.content_type
          })
        });

        if (!refreshResponse.ok) {
          console.error('Failed to refresh metadata:', await refreshResponse.text());
        } else {
          console.log('Metadata refresh triggered successfully');
        }
      } catch (refreshError) {
        console.error('Error triggering metadata refresh:', refreshError);
        // Don't fail the main request if refresh fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: data 
    });
  } catch (error) {
    console.error('Error in chrome extension save:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}