import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { openaiService } from '@/lib/services/openaiService';

export async function POST(request: NextRequest) {
  try {
    // Use service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if OpenAI is configured
    if (!openaiService.isAvailable()) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 503 }
      );
    }

    // Get request body
    const body = await request.json();
    const { title, content, description, url, thumbnailUrl, contentType, existingTags } = body;

    // Validate input
    if (!title && !content && !description) {
      return NextResponse.json(
        { error: 'At least one of title, content, or description is required' },
        { status: 400 }
      );
    }

    // TODO: Add proper rate limiting in production
    // For now, we'll skip rate limiting

    // Generate tags
    const tags = await openaiService.generateTags({
      title,
      content,
      description,
      url,
      thumbnailUrl,
      contentType,
      existingTags,
    });


    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Generate tags error:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'OpenAI rate limit exceeded' },
          { status: 429 }
        );
      }
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI configuration error' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate tags' },
      { status: 500 }
    );
  }
}