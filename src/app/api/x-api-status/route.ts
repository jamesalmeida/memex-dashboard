import { NextRequest, NextResponse } from 'next/server';
import { xApiService } from '@/lib/services/xApiService';
import { xApiRateLimiter } from '@/lib/services/xApiRateLimitPersistent';

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
    let rateLimitInfo = await xApiRateLimiter.getStatus();

    // Check rate limits if forced or if we don't have current info
    if (forceCheck || !rateLimitInfo.hasInfo || rateLimitInfo.remainingRequests === null) {
      console.log(forceCheck ? 'Force checking X API rate limit...' : 'Checking X API rate limit...');
      
      try {
        // Make a minimal API call to check rate limits
        const response = await fetch('https://api.twitter.com/2/tweets?ids=1', {
          headers: {
            'Authorization': `Bearer ${process.env.X_BEARER_TOKEN}`,
          }
        });

        // Update rate limit info from headers
        await xApiRateLimiter.updateFromHeaders(response.headers);
        
        // Log the response for debugging
        if (!response.ok) {
          console.log('X API check response:', response.status, response.statusText);
        }
        
        // Get updated status
        rateLimitInfo = await xApiRateLimiter.getStatus();
        console.log('Updated rate limit info:', rateLimitInfo);
        
      } catch (error) {
        console.error('Error checking X API rate limit:', error);
        // Return the existing info if the check fails
      }
    } else if (!rateLimitInfo.hasInfo) {
      // If we have no info at all, return a conservative estimate
      console.log('No rate limit info available, returning conservative estimate');
      rateLimitInfo = {
        hasInfo: false,
        isRateLimited: false,
        remainingRequests: 15, // X API Basic tier: 15 requests per 15 minutes
        resetTime: null,
        resetTimeString: '',
        minutesUntilReset: 15
      };
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