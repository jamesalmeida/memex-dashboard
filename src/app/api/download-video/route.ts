import { NextRequest, NextResponse } from 'next/server'
import ytdl from 'ytdl-core'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate the URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // Get video info first to check availability and get metadata
    const info = await ytdl.getInfo(url)
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim()
    
    // Check if video is available
    if (!info.videoDetails.isLiveContent && info.videoDetails.lengthSeconds === '0') {
      return NextResponse.json({ error: 'Video is not available for download' }, { status: 400 })
    }

    // Get available formats and choose the best one
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio')
    
    if (formats.length === 0) {
      return NextResponse.json({ error: 'No downloadable video format found' }, { status: 400 })
    }

    // Choose format - prefer mp4 with reasonable quality
    let chosenFormat = formats.find(f => f.container === 'mp4' && f.qualityLabel) || formats[0]
    
    // If video is too large (over 100MB), choose a lower quality
    if (chosenFormat.contentLength && parseInt(chosenFormat.contentLength) > 100 * 1024 * 1024) {
      const smallerFormats = formats.filter(f => 
        f.contentLength && parseInt(f.contentLength) < 100 * 1024 * 1024
      )
      if (smallerFormats.length > 0) {
        chosenFormat = smallerFormats[0]
      } else {
        return NextResponse.json({ 
          error: 'Video is too large to download (over 100MB). Try a shorter video.' 
        }, { status: 400 })
      }
    }

    // Create readable stream
    const videoStream = ytdl(url, { format: chosenFormat })
    
    // Convert to ReadableStream for Next.js
    const readableStream = new ReadableStream({
      start(controller) {
        videoStream.on('data', (chunk) => {
          controller.enqueue(chunk)
        })
        
        videoStream.on('end', () => {
          controller.close()
        })
        
        videoStream.on('error', (error) => {
          console.error('Stream error:', error)
          controller.error(error)
        })
      }
    })

    // Set headers for download
    const headers = new Headers({
      'Content-Type': chosenFormat.mimeType || 'video/mp4',
      'Content-Disposition': `attachment; filename="${title}.${chosenFormat.container || 'mp4'}"`,
      'Cache-Control': 'no-cache',
    })

    // If content length is available, set it
    if (chosenFormat.contentLength) {
      headers.set('Content-Length', chosenFormat.contentLength)
    }

    return new NextResponse(readableStream, { headers })

  } catch (error) {
    console.error('Error downloading video:', error)
    
    let errorMessage = 'Failed to download video'
    
    if (error instanceof Error) {
      if (error.message.includes('Video unavailable')) {
        errorMessage = 'Video is unavailable or private'
      } else if (error.message.includes('429')) {
        errorMessage = 'Too many requests. Please try again later.'
      } else if (error.message.includes('403')) {
        errorMessage = 'Video is restricted or requires sign-in'
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