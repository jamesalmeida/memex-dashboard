import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // Create a Supabase client with the service role key to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
  
  try {
    const { itemId, metadata } = await request.json()
    
    console.log('=== Update Metadata API ===');
    console.log('Item ID:', itemId);
    console.log('Metadata to update:', JSON.stringify(metadata, null, 2));
    
    if (!itemId || !metadata) {
      return NextResponse.json({ error: 'Item ID and metadata are required' }, { status: 400 })
    }

    // Check if metadata exists
    const { data: existing, error: selectError } = await supabase
      .from('item_metadata')
      .select('id')
      .eq('item_id', itemId)
      .single()
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing metadata:', selectError);
      return NextResponse.json({ error: 'Failed to check metadata' }, { status: 500 });
    }
    
    if (existing) {
      console.log('Updating existing metadata record');
      // Update existing metadata
      const { data, error } = await supabase
        .from('item_metadata')
        .update(metadata)
        .eq('item_id', itemId)
        .select()
        .single()
      
      if (error) {
        console.error('Update error:', error);
        return NextResponse.json({ 
          error: 'Failed to update metadata',
          details: error.message 
        }, { status: 500 });
      }
      
      console.log('Updated metadata:', data);
      return NextResponse.json({ success: true, metadata: data });
    } else {
      console.log('Creating new metadata record');
      // Create new metadata
      const cleanedMetadata = {
        item_id: itemId,
        author: metadata.author || null,
        domain: metadata.domain || null,
        video_url: metadata.video_url || null,
        duration: metadata.duration || null,
        file_size: metadata.file_size || null,
        page_count: metadata.page_count || null,
        username: metadata.username || null,
        likes: metadata.likes || null,
        replies: metadata.replies || null,
        retweets: metadata.retweets || null,
        views: metadata.views || null,
        stars: metadata.stars || null,
        forks: metadata.forks || null,
        language: metadata.language || null,
        price: metadata.price || null,
        rating: metadata.rating || null,
        reviews: metadata.reviews || null,
        in_stock: metadata.in_stock || null,
        citations: metadata.citations || null,
        published_date: metadata.published_date || null,
        journal: metadata.journal || null,
        extra_data: metadata.extra_data || {}
      };
      
      // Remove any undefined values
      Object.keys(cleanedMetadata).forEach(key => {
        if (cleanedMetadata[key as keyof typeof cleanedMetadata] === undefined) {
          delete cleanedMetadata[key as keyof typeof cleanedMetadata];
        }
      });
      
      console.log('Cleaned metadata for insert:', cleanedMetadata);
      
      const { data, error } = await supabase
        .from('item_metadata')
        .insert(cleanedMetadata)
        .select()
        .single()
      
      if (error) {
        console.error('Insert error:', error);
        return NextResponse.json({ 
          error: 'Failed to create metadata',
          details: error.message 
        }, { status: 500 });
      }
      
      console.log('Created metadata:', data);
      return NextResponse.json({ success: true, metadata: data });
    }
  } catch (error) {
    console.error('Update metadata error:', error);
    return NextResponse.json({ 
      error: 'Failed to update metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}