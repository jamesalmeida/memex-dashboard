import { NextRequest, NextResponse } from 'next/server'
import ytdl from 'ytdl-core'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    console.log('Download request for URL:', url)
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate the URL
    if (!ytdl.validateURL(url)) {
      console.error('Invalid YouTube URL:', url)
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    console.log('URL validated, getting video info...')
    
    // Get video info first to check availability and get metadata
    const info = await ytdl.getInfo(url)
    console.log('Got video info:', {
      title: info.videoDetails.title,
      videoId: info.videoDetails.videoId,
      lengthSeconds: info.videoDetails.lengthSeconds,
      isLive: info.videoDetails.isLiveContent,
      formats: info.formats.length
    })
    
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim()
    
    // Get available formats and choose the best one
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio')
    console.log(`Found ${formats.length} downloadable formats`)
    
    if (formats.length === 0) {
      console.error('No formats found. All formats:', info.formats.map(f => ({
        itag: f.itag,
        container: f.container,
        quality: f.qualityLabel,
        hasVideo: f.hasVideo,
        hasAudio: f.hasAudio
      })))
      return NextResponse.json({ error: 'No downloadable video format found' }, { status: 400 })
    }

    // Choose format - prefer mp4 with reasonable quality
    let chosenFormat = formats.find(f => f.container === 'mp4' && f.qualityLabel) || formats[0]
    console.log('Chosen format:', {
      itag: chosenFormat.itag,
      container: chosenFormat.container,
      quality: chosenFormat.qualityLabel,
      size: chosenFormat.contentLength,
      url: chosenFormat.url ? 'URL exists' : 'NO URL'
    })
    
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

    // Return the direct download URL instead of streaming
    console.log('Returning download URL...')
    const response = {
      downloadUrl: chosenFormat.url,
      filename: `${title}.${chosenFormat.container || 'mp4'}`,
      title: title,
      size: chosenFormat.contentLength,
      quality: chosenFormat.qualityLabel || 'Unknown'
    }
    console.log('Response (URL hidden):', { ...response, downloadUrl: response.downloadUrl ? 'URL exists' : 'NO URL' })
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error getting download URL:', error)
    
    let errorMessage = 'Failed to get download URL'
    
    if (error instanceof Error) {
      console.error('Full error message:', error.message)
      
      if (error.message.includes('Video unavailable')) {
        errorMessage = 'Video is unavailable or private'
      } else if (error.message.includes('429')) {
        errorMessage = 'Too many requests. Please try again later.'
      } else if (error.message.includes('403')) {
        errorMessage = 'Video is restricted or requires sign-in'
      } else if (error.message.includes('extract functions') || error.message.includes('unable to extract')) {
        errorMessage = 'YouTube changed their interface. ytdl-core needs an update. This is a common temporary issue.'
      } else {
        errorMessage = `${error.message} (This might be a temporary YouTube API issue)`
      }
    }
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    )
  }
}