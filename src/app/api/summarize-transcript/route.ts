import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { transcript, itemId } = await req.json();
    console.log('Received request for summarization:', { itemId, transcriptLength: transcript?.length });

    if (!transcript) {
      console.error('Error: Transcript is missing.');
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    if (!itemId) {
      console.error('Error: Item ID is missing.');
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Or another suitable model like "gpt-3.5-turbo"
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes YouTube video transcripts into concise TL;DR summaries." },
        { role: "user", content: `Please provide a TL;DR summary of the following YouTube transcript:\n\n${transcript}` },
      ],
      
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content;
    console.log('OpenAI API call successful. Summary length:', summary?.length);

    console.log('Attempting to save summary to Supabase...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error: updateError } = await supabase
      .from('items')
      .update({ tldr_summary: summary })
      .eq('id', itemId);

    if (updateError) {
      console.error('Error saving TLDR summary to Supabase:', updateError);
      return NextResponse.json({ error: 'Failed to save TLDR summary' }, { status: 500 });
    }
    console.log('TLDR summary saved to Supabase successfully.');

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing transcript (catch block):', error);
    console.error('Error summarizing transcript:', error);
    return NextResponse.json({ error: 'Failed to summarize transcript' }, { status: 500 });
  }
}