import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { itemsService } from '@/lib/supabase/services'
import type { ContentType } from '@/types/database'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  try {
    const { 
      title, 
      url, 
      content_type = 'bookmark',
      description,
      thumbnail_url,
      raw_text,
      space_id,
      metadata 
    } = await req.json()

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // Create the item using the service
    const newItem = await itemsService.createItem({
      title,
      url,
      content_type: content_type as ContentType,
      description,
      thumbnail_url,
      raw_text,
      space_id
    })

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      await itemsService.updateItemMetadata(newItem.id, metadata)
    }

    // Return the created item with full details
    const fullItem = await itemsService.getItem(newItem.id)
    
    return NextResponse.json(fullItem, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const spaceId = searchParams.get('space_id')
    const query = searchParams.get('q')

    let items
    if (query) {
      items = await itemsService.searchItems(query)
    } else {
      items = await itemsService.getItems(spaceId || undefined)
    }

    return NextResponse.json({ items }, { status: 200 })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    )
  }
}