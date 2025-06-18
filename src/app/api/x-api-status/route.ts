import { NextRequest, NextResponse } from 'next/server';
import { xApiService } from '@/lib/services/xApiService';
import { xApiRateLimiter } from '@/lib/services/xApiRateLimit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const forceCheck = searchParams.get('force') === 'true';
    
    // Check if X API is configured
    const isConfigured = xApiService.isAvailable();
    
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        message: 'X API credentials not configured'
      });
    }

    // Get current rate limit status from memory
    let rateLimitInfo = xApiRateLimiter.getStatus();

    // If force check is requested or we don't have info, make a lightweight API call
    if (forceCheck || !rateLimitInfo.hasInfo) {
      console.log(forceCheck ? 'Force checking X API rate limit...' : 'No rate limit info, checking...');
      
      try {
        // Make a minimal API call to check rate limits
        const response = await fetch('https://api.twitter.com/2/tweets?ids=1', {
          headers: {
            'Authorization': `Bearer ${process.env.X_BEARER_TOKEN}`,
          }
        });

        // Update rate limit info from headers
        xApiRateLimiter.updateFromHeaders(response.headers);
        
        // Log the response for debugging
        if (!response.ok) {
          console.log('X API check response:', response.status, response.statusText);
        }
        
        // Get updated status
        rateLimitInfo = xApiRateLimiter.getStatus();
        console.log('Updated rate limit info:', rateLimitInfo);
        
      } catch (error) {
        console.error('Error checking X API rate limit:', error);
        // Return the existing info if the check fails
      }
    }

    return NextResponse.json({
      configured: true,
      ...rateLimitInfo
    });

  } catch (error) {
    console.error('Error in X API status endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}