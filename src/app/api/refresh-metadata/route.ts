import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { jinaService } from '@/lib/services/jinaService'
import { xApiService } from '@/lib/services/xApiService'
import { createClient } from '@supabase/supabase-js'

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
    const { itemId, url } = await request.json()
    
    console.log('Item ID:', itemId);
    console.log('URL:', url);
    
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

    // Check if this is an X/Twitter post
    const isXPost = url.includes('twitter.com') || url.includes('x.com');
    console.log('Is X Post:', isXPost, 'URL:', url);
    console.log('X API Available:', xApiService.isAvailable());
    
    let metadata = null;
    
    // Try X API for Twitter posts if available
    if (isXPost && xApiService.isAvailable()) {
      console.log('Attempting to refresh X/Twitter content with X API...');
      metadata = await xApiService.fetchTweet(url);
      
      if (metadata) {
        console.log('Successfully refreshed metadata with X API');
        console.log('X API metadata published_date:', metadata.published_date);
        
        // Add domain
        const urlObj = new URL(url);
        metadata.domain = urlObj.hostname;
        
        // Clear title for X posts (we use content instead)
        metadata.title = '';
      } else {
        console.log('X API extraction failed, falling back to traditional scraping...');
      }
    }
    
    // If X API failed or not available, use traditional scraping
    if (!metadata) {
      // For non-X posts, try Jina Reader API
      if (!isXPost && jinaService.isAvailable()) {
        console.log('Attempting to refresh content with Jina Reader API...');
        metadata = await jinaService.extractContent(url);
      }
      
      // If Jina failed or not available, use traditional scraping
      if (!metadata) {
        console.log('Using traditional scraping for refresh...');
        
        // Fetch the webpage
        const headers = url.includes('instagram.com') ? {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        } : {
          'User-Agent': 'Mozilla/5.0 (compatible; Memex/1.0; +https://memex.garden)',
        };
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          console.error('Failed to fetch URL:', response.status, response.statusText);
          return NextResponse.json({ error: 'Failed to fetch URL' }, { status: response.status });
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Extract basic metadata
        metadata = {
          title: $('meta[property="og:title"]').attr('content') || 
                 $('meta[name="twitter:title"]').attr('content') || 
                 $('title').text() || '',
          description: $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || '',
          thumbnail_url: $('meta[property="og:image"]').attr('content') || 
                         $('meta[name="twitter:image"]').attr('content') || '',
          domain: new URL(url).hostname,
        };
        
        // Extract X/Twitter specific data from HTML
        if (isXPost) {
          // Try to extract tweet content from various meta tags
          const tweetText = $('meta[property="og:description"]').attr('content') || 
                           $('meta[name="description"]').attr('content') || '';
          
          if (tweetText) {
            metadata.content = tweetText.replace(/" on X$/, '').trim();
          }
          
          // Clear title for X posts
          metadata.title = '';
        }
      }
    }
    
    if (!metadata) {
      console.error('Failed to extract any metadata');
      return NextResponse.json({ error: 'Failed to extract metadata' }, { status: 500 });
    }
    
    console.log('Refreshed metadata:', metadata);
    
    // Update the item in the database
    const updateData: any = {
      title: metadata.title || existingItem.title,
      description: metadata.description || existingItem.description,
      thumbnail_url: metadata.thumbnail_url || existingItem.thumbnail_url,
      content: metadata.content || existingItem.content,
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
    if (metadata.author || metadata.username || metadata.profile_image || 
        metadata.video_url || metadata.likes || metadata.retweets || 
        metadata.replies || metadata.views || metadata.published_date || metadata.extra_data) {
      
      // Access metadata correctly - it might be an array or object depending on the join
      const existingMetadata = Array.isArray(existingItem.metadata) 
        ? existingItem.metadata[0] 
        : existingItem.metadata;
      
      const metadataInput: Record<string, unknown> = {
        domain: metadata.domain || existingMetadata?.domain,
        author: metadata.author || existingMetadata?.author,
        username: metadata.username || existingMetadata?.username,
        profile_image: metadata.profile_image || existingMetadata?.profile_image,
        video_url: metadata.video_url || existingMetadata?.video_url,
        published_date: metadata.published_date || existingMetadata?.published_date,
        likes: metadata.likes ?? existingMetadata?.likes,
        replies: metadata.replies ?? existingMetadata?.replies,
        retweets: metadata.retweets ?? existingMetadata?.retweets,
        views: metadata.views ?? existingMetadata?.views,
        extra_data: metadata.extra_data || existingMetadata?.extra_data || {}
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