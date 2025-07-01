import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { itemId, url, contentType } = await request.json();

    if (!itemId || !url) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if transcript already exists in database
    // Use service role key for server-side operations that bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: item } = await supabase
      .from('items')
      .select('*, metadata:item_metadata(*)')
      .eq('id', itemId)
      .single();

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item?.metadata?.[0]?.extra_data?.transcript) {
      return NextResponse.json({
        transcript: item.metadata[0].extra_data.transcript,
        cached: true
      });
    }

    let transcript = '';

    if (contentType === 'youtube') {
      // Extract YouTube video ID
      const videoIdMatch = url.match(/(?:v=|youtu\.be\/|shorts\/|live\/)([a-zA-Z0-9_-]+)/);
      const videoId = videoIdMatch?.[1];

      if (!videoId) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL' },
          { status: 400 }
        );
      }

      try {
        // Import YouTube.js
        const { Innertube } = await import('youtubei.js');
        
        // Create YouTube client and get transcript
        const youtube = await Innertube.create();
        
        let transcriptData;
        try {
          const videoInfo = await youtube.getInfo(videoId);
          transcriptData = await videoInfo.getTranscript();
        } catch (parseError) {
          // YouTube.js parser error - try alternative approach
          console.warn('YouTube.js parser error, attempting alternative method:', parseError);
          
          // Fallback: Try to get transcript directly without full video info
          try {
            const basicInfo = await youtube.getBasicInfo(videoId);
            transcriptData = await basicInfo.getTranscript();
          } catch (fallbackError) {
            throw new Error('Unable to retrieve transcript due to YouTube API changes. This video may not have captions available or YouTube has updated their interface.');
          }
        }
        
        if (!transcriptData) {
          throw new Error('No transcript available for this video');
        }
        
        // Extract text from transcript segments - try different possible paths
        let segments = [];
        
        // Try different possible locations for segments
        if (transcriptData.transcript?.content?.body?.initial_segments) {
          segments = transcriptData.transcript.content.body.initial_segments;
        } else if (transcriptData.content?.body?.initial_segments) {
          segments = transcriptData.content.body.initial_segments;
        } else if (transcriptData.transcript?.segments) {
          segments = transcriptData.transcript.segments;
        } else if (transcriptData.segments) {
          segments = transcriptData.segments;
        } else if (Array.isArray(transcriptData.transcript)) {
          segments = transcriptData.transcript;
        }
        
        if (segments.length === 0) {
          throw new Error('Transcript is empty or not available');
        }
        
        // Format transcript from segments
        transcript = segments
          .map((segment: any) => {
            // The text is in segment.snippet.text
            return segment.snippet?.text || '';
          })
          .filter((text: string) => text.trim().length > 0)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Check if transcript is empty
        if (!transcript || transcript.length === 0) {
          return NextResponse.json(
            { error: 'No transcript available for this video. The video may not have captions.' },
            { status: 404 }
          );
        }
      } catch (error) {
        console.error('Failed to fetch YouTube transcript:', error);
        
        // Check if it's a specific parser error from YouTube.js
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('CompositeVideoPrimaryInfo') || errorMessage.includes('parser')) {
          return NextResponse.json(
            { 
              error: 'YouTube has updated their interface and transcript extraction is temporarily unavailable. Please try again later or contact support if this persists.' 
            },
            { status: 503 } // Service temporarily unavailable
          );
        }
        
        return NextResponse.json(
          { 
            error: errorMessage.includes('not have captions') 
              ? 'This video does not have captions available.' 
              : 'Failed to fetch transcript. Video may not have captions available or may be restricted.'
          },
          { status: 404 }
        );
      }
    } else if (contentType === 'audio') {
      // For audio/podcasts, we need to use a transcription service
      // Options:
      // 1. OpenAI Whisper API
      // 2. AssemblyAI
      // 3. Google Cloud Speech-to-Text
      // 4. AWS Transcribe
      
      // Example with OpenAI Whisper (requires API key)
      /*
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData
      });
      
      const data = await response.json();
      transcript = data.text;
      */
      
      // For now, return an error for audio
      return NextResponse.json(
        { error: 'Audio transcription not yet implemented. Requires transcription service setup.' },
        { status: 501 }
      );
    }

    // Save transcript to database
    if (transcript) {
      // Check if metadata exists
      const { data: metadata, error: selectError } = await supabase
        .from('item_metadata')
        .select('*')
        .eq('item_id', itemId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking for existing metadata:', selectError);
      }

      if (metadata) {
        // Update existing metadata
        const { error: updateError } = await supabase
          .from('item_metadata')
          .update({
            extra_data: {
              ...metadata.extra_data,
              transcript: transcript
            }
          })
          .eq('item_id', itemId);
          
        if (updateError) {
          console.error('Error updating metadata with transcript:', updateError);
          throw new Error('Failed to save transcript to database');
        }
      } else {
        // Create new metadata
        const { error: insertError } = await supabase
          .from('item_metadata')
          .insert({
            item_id: itemId,
            extra_data: {
              transcript: transcript
            }
          });
          
        if (insertError) {
          console.error('Error creating metadata with transcript:', insertError);
          throw new Error('Failed to save transcript to database');
        }
      }
    }

    return NextResponse.json({
      transcript,
      cached: false
    });
  } catch (error) {
    console.error('Transcript generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate transcript' },
      { status: 500 }
    );
  }
}