
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { imageUrl, text } = await request.json();

  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Describe the following image. If there is text in the image, please include it in the description. Additional context from the post: ${text}` },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    return NextResponse.json({ description: response.choices[0].message.content });
  } catch (error) {
    console.error('Error describing image:', error);
    return NextResponse.json({ error: 'Failed to describe image' }, { status: 500 });
  }
}
