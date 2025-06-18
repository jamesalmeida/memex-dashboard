/**
 * Rate limit tracker for X API with persistence
 */
class XApiRateLimitTracker {
  private resetTime: Date | null = null;
  private remainingRequests: number = 1; // Assume free tier (1 request per 15 min)
  private isRateLimited: boolean = false;
  private STORAGE_KEY = 'x-api-rate-limit-server';

  constructor() {
    // Try to load from storage on initialization
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      // In a server environment, we can't use localStorage
      // This would need to be stored in a database or Redis in production
      // For now, we'll just use in-memory storage
      console.log('Rate limit tracker initialized (in-memory only)');
    } catch (error) {
      console.error('Error loading rate limit from storage:', error);
    }
  }

  /**
   * Update rate limit info from response headers
   */
  updateFromHeaders(headers: Headers) {
    const remaining = headers.get('x-rate-limit-remaining');
    const reset = headers.get('x-rate-limit-reset');
    const limit = headers.get('x-rate-limit-limit');

    if (remaining !== null) {
      this.remainingRequests = parseInt(remaining, 10);
      console.log(`X API Rate Limit - Remaining: ${this.remainingRequests}`);
    }

    if (reset !== null) {
      this.resetTime = new Date(parseInt(reset, 10) * 1000);
      console.log(`X API Rate Limit - Reset time: ${this.resetTime.toISOString()}`);
    }

    if (limit !== null) {
      console.log(`X API Rate Limit - Total limit: ${limit}`);
    }

    // Check if we're rate limited
    this.isRateLimited = this.remainingRequests === 0;
  }

  /**
   * Check if we should skip the API due to rate limits
   */
  shouldSkipRequest(): boolean {
    // If we're not rate limited, allow the request
    if (!this.isRateLimited) {
      return false;
    }

    // If we're rate limited, check if the reset time has passed
    if (this.resetTime && new Date() > this.resetTime) {
      console.log('X API rate limit reset time has passed, allowing request');
      this.isRateLimited = false;
      this.remainingRequests = 1; // Reset to free tier default
      return false;
    }

    // Still rate limited
    if (this.resetTime) {
      const minutesUntilReset = Math.ceil((this.resetTime.getTime() - Date.now()) / 1000 / 60);
      console.log(`X API rate limited. Reset in ${minutesUntilReset} minutes`);
    }
    return true;
  }

  /**
   * Mark that we've been rate limited
   */
  markRateLimited(resetTime?: Date) {
    this.isRateLimited = true;
    this.remainingRequests = 0;
    if (resetTime) {
      this.resetTime = resetTime;
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus() {
    const now = new Date();
    const isCurrentlyRateLimited = this.shouldSkipRequest();
    
    let minutesUntilReset = null;
    let resetTimeString = null;
    
    if (this.resetTime) {
      minutesUntilReset = Math.max(0, Math.ceil((this.resetTime.getTime() - now.getTime()) / 1000 / 60));
      resetTimeString = this.resetTime.toLocaleTimeString();
    }

    return {
      hasInfo: this.resetTime !== null,
      isRateLimited: isCurrentlyRateLimited,
      remainingRequests: this.remainingRequests,
      resetTime: this.resetTime?.toISOString() || null,
      resetTimeString,
      minutesUntilReset,
      message: isCurrentlyRateLimited 
        ? `Rate limited. Resets in ${minutesUntilReset} minutes (${resetTimeString})`
        : `${this.remainingRequests} requests remaining`
    };
  }
}

// Export singleton instance
export const xApiRateLimiter = new XApiRateLimitTracker();