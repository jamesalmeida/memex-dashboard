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

  const { item_id, space_id } = await req.json();
  console.log('Initiate chat API received - item_id:', item_id, 'space_id:', space_id);

  if (!item_id && !space_id) {
    return NextResponse.json({ error: 'Either item_id or space_id is required' }, { status: 400 });
  }

  try {
    let chatData;
    let chatError;

    // Try to find an existing chat
    if (item_id) {
      ({ data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('item_id', item_id)
        .limit(1));
      console.log('Supabase query for existing chat (item_id):', chatData, chatError);
    } else if (space_id) {
      ({ data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('space_id', space_id)
        .limit(1));
      console.log('Supabase query for existing chat (space_id):', chatData, chatError);
    }

    let chatId;
    if (chatData && chatData.length > 0) {
      chatId = chatData[0].id;
    } else {
      // If no existing chat, create a new one
      let insertData: { item_id?: string; space_id?: string } = {};
      if (item_id) {
        insertData.item_id = item_id;
      } else if (space_id) {
        insertData.space_id = space_id;
      }

      const { data: newChatData, error: newChatError } = await supabase
        .from('chats')
        .insert(insertData)
        .select('id')
        .single();

      if (newChatError) {
        console.error('Error creating new chat:', newChatError);
        return NextResponse.json({ error: 'Failed to initiate chat' }, { status: 500 });
      }
      chatId = newChatData.id;
    }

    // Fetch messages for the chat
    const { data: messagesData, error: messagesError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching chat messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 });
    }

    return NextResponse.json({ chatId, messages: messagesData });
  } catch (error) {
    console.error('Error in initiate chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
