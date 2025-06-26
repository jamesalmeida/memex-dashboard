import { NextRequest, NextResponse } from 'next/server'
import { extractorRegistry } from '@/lib/extractors/registry'
import { createClient } from '@supabase/supabase-js'

/**
 * Transform new metadata format to match database schema
 */
function transformMetadataForDatabase(metadata: any): any {
  const response: any = {
    title: metadata.title || '',
    description: metadata.description || '',
    thumbnail_url: metadata.thumbnail || '',
    content: metadata.description || metadata.title || '',
  };
  
  // Prepare metadata fields for item_metadata table
  const metadataFields: any = {
    domain: new URL(metadata.url).hostname,
  };
  
  // Content type specific transformations
  switch (metadata.contentType) {
    case 'twitter':
      response.title = ''; // Twitter posts don't have titles
      response.content = metadata.description || '';
      
      metadataFields.username = metadata.author?.username;
      metadataFields.author = metadata.author?.name;
      metadataFields.profile_image = metadata.author?.profileImage;
      metadataFields.likes = metadata.engagement?.likes;
      metadataFields.retweets = metadata.engagement?.retweets;
      metadataFields.replies = metadata.engagement?.replies;
      metadataFields.views = metadata.engagement?.views;
      metadataFields.published_date = metadata.publishedAt;
      
      // Handle video
      if (metadata.media?.videos?.length > 0) {
        // Find the best MP4 video
        const mp4Videos = metadata.media.videos.filter((v: any) => 
          v.format === 'video/mp4' || v.url?.includes('.mp4')
        );
        
        if (mp4Videos.length > 0) {
          metadataFields.video_url = mp4Videos[0].url;
        } else {
          // Fallback to first non-m3u8 video
          const nonHlsVideo = metadata.media.videos.find((v: any) => 
            !v.url?.includes('.m3u8') && !v.format?.includes('mpegURL')
          );
          metadataFields.video_url = nonHlsVideo?.url || metadata.media.videos[0].url;
        }
        
        metadataFields.extra_data = {
          video_variants: metadata.media.videos,
          display_name: metadata.author?.name || ''
        };
      } else {
        metadataFields.extra_data = {
          display_name: metadata.author?.name || ''
        };
      }
      break;
      
    case 'youtube':
      metadataFields.duration = metadata.duration;
      metadataFields.author = metadata.channelName;
      metadataFields.extra_data = {
        channel_url: metadata.channelUrl,
        video_id: metadata.videoId,
      };
      break;
      
    case 'instagram':
      metadataFields.username = metadata.author?.username;
      metadataFields.extra_data = {
        post_type: metadata.postType,
        images: metadata.carousel?.map((img: any) => img.url) || 
                metadata.media?.images?.map((img: any) => img.url) || [],
      };
      break;
  }
  
  response.metadata = metadataFields;
  return response;
}

export async function POST(request: NextRequest) {
  // Create a Supabase client with the service role key to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
    console.log('Using public client instead - this may fail due to RLS');
    // Fall back to importing the public client
    const { supabase } = await import('@/utils/supabaseClient');
    return handleRefresh(request, supabase);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
  
  return handleRefresh(request, supabase);
}

async function handleRefresh(request: NextRequest, supabase: any) {
  console.log('=== Refresh Metadata API Started ===');
  try {
    const { itemId, url, contentType } = await request.json()
    
    console.log('Item ID:', itemId);
    console.log('URL:', url);
    console.log('Content Type:', contentType);
    
    if (!itemId || !url) {
      console.log('Error: Item ID and URL are required');
      return NextResponse.json({ error: 'Item ID and URL are required' }, { status: 400 })
    }

    // First, let's check if the item exists at all
    const { data: checkItem, error: checkError } = await supabase
      .from('items')
      .select('id, user_id')
      .eq('id', itemId);
    
    console.log('Item check result:', checkItem);
    console.log('Item check error:', checkError);
    
    if (!checkItem || checkItem.length === 0) {
      console.error('Item not found in database');
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Now fetch with metadata
    const { data: existingItem, error: fetchError } = await supabase
      .from('items')
      .select('*, metadata:item_metadata(*)')
      .eq('id', itemId)
      .single();

    if (fetchError || !existingItem) {
      console.error('Failed to fetch existing item with metadata:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
    }

    // Use the extractor registry to extract metadata
    console.log('Using extractor registry for URL:', url);
    
    let extractorResult;
    try {
      extractorResult = await extractorRegistry.extract(url, { contentType });
      console.log('Extraction result:', {
        contentType: extractorResult.metadata.contentType,
        confidence: extractorResult.confidence,
        source: extractorResult.source,
      });
    } catch (extractError) {
      console.error('Extractor failed:', extractError);
      return NextResponse.json({ error: 'Failed to extract metadata' }, { status: 500 });
    }
    
    const metadata = extractorResult.metadata;
    
    console.log('Refreshed metadata:', metadata);
    
    // Transform metadata to match database schema
    const transformedMetadata = transformMetadataForDatabase(metadata);
    
    // Update the item in the database
    const updateData: any = {
      title: transformedMetadata.title ?? existingItem.title,
      description: transformedMetadata.description || existingItem.description,
      thumbnail_url: transformedMetadata.thumbnail_url || existingItem.thumbnail_url,
      content: transformedMetadata.content || existingItem.content,
      content_type: metadata.contentType || existingItem.content_type,
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', itemId);
    
    if (updateError) {
      console.error('Failed to update item:', updateError);
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
    
    // Update metadata if we have additional fields
    if (transformedMetadata.metadata) {
      
      // Access metadata correctly - it might be an array or object depending on the join
      const existingMetadata = Array.isArray(existingItem.metadata) 
        ? existingItem.metadata[0] 
        : existingItem.metadata;
      
      const metadataInput: Record<string, unknown> = {
        ...transformedMetadata.metadata,
        // Preserve existing data if new data is missing
        domain: transformedMetadata.metadata.domain || existingMetadata?.domain,
        author: transformedMetadata.metadata.author || existingMetadata?.author,
        username: transformedMetadata.metadata.username || existingMetadata?.username,
        profile_image: transformedMetadata.metadata.profile_image || existingMetadata?.profile_image,
        video_url: transformedMetadata.metadata.video_url || existingMetadata?.video_url,
        published_date: transformedMetadata.metadata.published_date || existingMetadata?.published_date,
        likes: transformedMetadata.metadata.likes ?? existingMetadata?.likes,
        replies: transformedMetadata.metadata.replies ?? existingMetadata?.replies,
        retweets: transformedMetadata.metadata.retweets ?? existingMetadata?.retweets,
        views: transformedMetadata.metadata.views ?? existingMetadata?.views,
        extra_data: {
          ...(existingMetadata?.extra_data || {}),
          ...(transformedMetadata.metadata.extra_data || {})
        }
      };
      
      console.log('Metadata input before cleanup:', metadataInput);
      console.log('Published date value:', metadataInput.published_date);
      
      // Remove undefined values
      Object.keys(metadataInput).forEach(key => {
        if (metadataInput[key] === undefined) {
          delete metadataInput[key];
        }
      });
      
      console.log('Metadata input after cleanup:', metadataInput);
      
      const { error: metadataError } = await supabase
        .from('item_metadata')
        .upsert({
          item_id: itemId,
          ...metadataInput
        }, {
          onConflict: 'item_id'
        });
      
      if (metadataError) {
        console.error('Failed to update metadata:', metadataError);
        // Don't fail the entire request if metadata update fails
      }
    }
    
    console.log('=== Refresh Metadata API Completed ===');
    return NextResponse.json({ 
      success: true,
      metadata: metadata 
    });
    
  } catch (error) {
    console.error('Refresh metadata error:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}