import { NextRequest, NextResponse } from 'next/server'
import { urlMetadataService } from '@/lib/services/urlMetadata'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    const result = await urlMetadataService.analyzeUrl(url)
    return NextResponse.json({
      success: true,
      url,
      result
    })
  } catch (error) {
    console.error('Error testing metadata extraction:', error)
    return NextResponse.json({
      success: false,
      url,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Test some common URLs
export async function POST() {
  const testUrls = [
    'https://github.com/vercel/next.js',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://x.com/vercel/status/1234567890',
    'https://www.amazon.com/dp/B08N5WRWNW',
    'https://en.wikipedia.org/wiki/Artificial_intelligence'
  ]

  const results = []

  for (const url of testUrls) {
    try {
      const result = await urlMetadataService.analyzeUrl(url)
      results.push({
        url,
        success: true,
        contentType: result.content_type,
        title: result.metadata.title,
        confidence: result.confidence
      })
    } catch (error) {
      results.push({
        url,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return NextResponse.json({
    testResults: results,
    summary: {
      total: testUrls.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  })
}