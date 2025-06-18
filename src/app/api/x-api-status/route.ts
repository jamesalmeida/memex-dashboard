import { NextRequest, NextResponse } from 'next/server';
import { xApiService } from '@/lib/services/xApiService';
import { xApiRateLimiter } from '@/lib/services/xApiRateLimit';

export async function GET(req: NextRequest) {
  try {
    // Check if X API is configured
    const isConfigured = xApiService.isAvailable();
    
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        message: 'X API credentials not configured'
      });
    }

    // Get current rate limit status from memory
    const rateLimitInfo = xApiRateLimiter.getStatus();

    // If we don't have rate limit info yet, make a lightweight API call to get it
    if (!rateLimitInfo.hasInfo) {
      console.log('Fetching fresh rate limit info from X API...');
      
      try {
        const response = await fetch('https://api.twitter.com/2/tweets?ids=1', {
          headers: {
            'Authorization': `Bearer ${process.env.X_BEARER_TOKEN}`,
          }
        });

        xApiRateLimiter.updateFromHeaders(response.headers);
        
        // Get updated status
        const updatedInfo = xApiRateLimiter.getStatus();
        
        return NextResponse.json({
          configured: true,
          ...updatedInfo
        });
      } catch (error) {
        console.error('Error checking X API status:', error);
        return NextResponse.json({
          configured: true,
          error: 'Failed to check API status',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
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