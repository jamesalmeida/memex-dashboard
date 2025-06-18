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

    // If we don't have rate limit info, return a default response
    // The actual rate limit info will be updated when we make real API calls
    if (!rateLimitInfo.hasInfo) {
      console.log('No rate limit info available yet - will be updated on first API call');
      
      return NextResponse.json({
        configured: true,
        hasInfo: false,
        isRateLimited: false,
        remainingRequests: 1, // Assume we have at least 1 request
        resetTime: null,
        resetTimeString: null,
        minutesUntilReset: null,
        message: 'Rate limit info will be updated on first API call'
      });
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