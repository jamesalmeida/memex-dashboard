
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { Buffer } from 'buffer';
import { Readable } from 'stream';
import { File } from 'node:buffer';

// Define globalThis.File for OpenAI SDK compatibility in Node.js environment
if (typeof globalThis.File === 'undefined') {
  globalThis.File = File;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { videoUrl } = await request.json();

  if (!videoUrl) {
    return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 });
  }

  try {
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video from ${videoUrl}: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    const contentType = videoResponse.headers.get('Content-Type') || 'application/octet-stream';

    // Create a Readable stream from the video blob
    const videoStream = Readable.from(Buffer.from(await videoBlob.arrayBuffer()));
    (videoStream as any).name = 'video.mp4'; // Assign a filename property
    (videoStream as any).type = contentType; // Assign a type property

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: videoStream,
    });

    return NextResponse.json({ transcript: transcription.text });
  } catch (error) {
    console.error('Error transcribing video:', error);
    return NextResponse.json({ error: 'Failed to transcribe video' }, { status: 500 });
  }
}
