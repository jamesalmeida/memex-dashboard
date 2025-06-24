import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

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

    // Create item data matching the items table schema
    const itemData = {
      user_id: userIdFromHeader,
      title: title,
      url: url,
      content_type: 'bookmark',
      content: selection || '',
      description: selection ? selection.substring(0, 200) : null,
      raw_text: selection || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

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

    return NextResponse.json({ 
      success: true, 
      data: data 
    });
  } catch (error) {
    console.error('Error in chrome extension save:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}