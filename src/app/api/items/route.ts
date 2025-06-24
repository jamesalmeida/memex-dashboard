import { NextRequest, NextResponse } from 'next/server'
import { getItemsServer, searchItemsServer } from '@/lib/supabase/services/items.server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Removed edge runtime due to cookies() not being compatible with edge runtime

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('space') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    
    let items
    if (search) {
      items = await searchItemsServer(search, limit)
    } else {
      items = await getItemsServer(spaceId, limit, offset)
    }
    
    const response = NextResponse.json({
      items,
      hasMore: items.length === limit
    })
    
    // Add cache headers for edge caching
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=86400')
    
    return response
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}