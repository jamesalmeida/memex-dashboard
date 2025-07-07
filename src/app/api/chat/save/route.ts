import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  );

  const { chat_id, role, content } = await req.json();

  if (!chat_id || !role || !content) {
    return NextResponse.json({ error: 'chat_id, role, and content are required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ chat_id, role, content })
      .select();

    if (error) {
      console.error('Error saving chat message:', error);
      return NextResponse.json({ error: 'Failed to save chat message' }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error in save chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
