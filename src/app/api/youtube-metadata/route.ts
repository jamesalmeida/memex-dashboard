import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Extract video ID from YouTube URL
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]+)/)
    const videoId = videoIdMatch?.[1]
    
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // Import YouTube.js dynamically
    const { Innertube } = await import('youtubei.js')
    
    // Initialize YouTube client
    const youtube = await Innertube.create()
    
    // Get video info
    const videoInfo = await youtube.getInfo(videoId)
    
    if (!videoInfo) {
      return NextResponse.json({ error: 'Video not found or unavailable' }, { status: 404 })
    }

    // Extract metadata
    const metadata = {
      title: videoInfo.basic_info.title || '',
      description: videoInfo.basic_info.short_description || '',
      duration: videoInfo.basic_info.duration?.text || '',
      view_count: videoInfo.basic_info.view_count || 0,
      like_count: videoInfo.basic_info.like_count || 0,
      upload_date: videoInfo.basic_info.upload_date || '',
      channel: {
        name: videoInfo.basic_info.channel?.name || '',
        id: videoInfo.basic_info.channel?.id || '',
        url: videoInfo.basic_info.channel?.url || '',
        subscriber_count: videoInfo.basic_info.channel?.subscriber_count || 0,
        avatar: videoInfo.basic_info.channel?.avatar?.[0]?.url || ''
      },
      thumbnails: (() => {
        const thumbnails = videoInfo.basic_info.thumbnail || [];
        
        // Find the highest resolution thumbnail
        const maxRes = thumbnails.find(t => t.width && t.width >= 1280) || 
                      thumbnails.find(t => t.width && t.width >= 640) ||
                      thumbnails.find(t => t.width && t.width >= 480) ||
                      thumbnails[thumbnails.length - 1] ||
                      {};
        
        return {
          default: thumbnails[0]?.url || '',
          medium: thumbnails.find(t => t.width && t.width >= 320)?.url || thumbnails[1]?.url || '',
          high: thumbnails.find(t => t.width && t.width >= 480)?.url || thumbnails[2]?.url || '',
          maxres: maxRes.url || ''
        };
      })(),
      category: videoInfo.basic_info.category || '',
      language: videoInfo.basic_info.language || '',
      is_live: videoInfo.basic_info.is_live || false,
      is_upcoming: videoInfo.basic_info.is_upcoming || false,
      tags: videoInfo.basic_info.tags || []
    }

    return NextResponse.json({
      success: true,
      metadata
    })

  } catch (error) {
    console.error('Error getting YouTube metadata:', error)
    
    let errorMessage = 'Failed to get YouTube metadata'
    
    if (error instanceof Error) {
      if (error.message.includes('Video unavailable')) {
        errorMessage = 'Video is unavailable or private'
      } else if (error.message.includes('404')) {
        errorMessage = 'Video not found'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    )
  }
}