
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { videoUrl } = await request.json();

  if (!videoUrl) {
    return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 });
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: await fetch(videoUrl).then((res) => res.blob()),
    });

    return NextResponse.json({ transcript: transcription.text });
  } catch (error) {
    console.error('Error transcribing video:', error);
    return NextResponse.json({ error: 'Failed to transcribe video' }, { status: 500 });
  }
}
