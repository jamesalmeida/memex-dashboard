import { createClient } from '@supabase/supabase-js';

/**
 * Persistent rate limit tracker for X API using Supabase
 */
class XApiRateLimitPersistent {
  private supabase: any;
  private cacheKey = 'x_api_rate_limit';
  private memoryCache: { resetTime?: Date; remainingRequests?: number; lastChecked?: Date } = {};
  
  constructor() {
    // Initialize Supabase client if credentials are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });
      console.log('X API Rate Limit: Persistent storage initialized');
    } else {
      console.log('X API Rate Limit: No Supabase credentials, using memory only');
    }
  }

  /**
   * Load rate limit info from database
   */
  private async loadFromDatabase(): Promise<void> {
    if (!this.supabase) return;
    
    try {
      const { data, error } = await this.supabase
        .from('app_settings')
        .select('value')
        .eq('key', this.cacheKey)
        .single();
      
      if (data && data.value) {
        const parsed = JSON.parse(data.value);
        this.memoryCache = {
          resetTime: parsed.resetTime ? new Date(parsed.resetTime) : undefined,
          remainingRequests: parsed.remainingRequests,
          lastChecked: parsed.lastChecked ? new Date(parsed.lastChecked) : undefined
        };
        console.log('X API Rate Limit: Loaded from database', this.memoryCache);
      }
    } catch (error) {
      console.error('X API Rate Limit: Error loading from database:', error);
    }
  }

  /**
   * Save rate limit info to database
   */
  private async saveToDatabase(): Promise<void> {
    if (!this.supabase) return;
    
    try {
      const value = JSON.stringify({
        resetTime: this.memoryCache.resetTime?.toISOString(),
        remainingRequests: this.memoryCache.remainingRequests,
        lastChecked: this.memoryCache.lastChecked?.toISOString()
      });
      
      await this.supabase
        .from('app_settings')
        .upsert({
          key: this.cacheKey,
          value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });
        
      console.log('X API Rate Limit: Saved to database', this.memoryCache);
    } catch (error) {
      console.error('X API Rate Limit: Error saving to database:', error);
    }
  }

  /**
   * Update rate limit info from response headers
   */
  async updateFromHeaders(headers: Headers): Promise<void> {
    const remaining = headers.get('x-rate-limit-remaining');
    const reset = headers.get('x-rate-limit-reset');
    const limit = headers.get('x-rate-limit-limit');

    if (remaining !== null) {
      this.memoryCache.remainingRequests = parseInt(remaining, 10);
      console.log(`X API Rate Limit - Remaining: ${this.memoryCache.remainingRequests}`);
    }

    if (reset !== null) {
      this.memoryCache.resetTime = new Date(parseInt(reset, 10) * 1000);
      console.log(`X API Rate Limit - Reset time: ${this.memoryCache.resetTime.toISOString()}`);
    }

    if (limit !== null) {
      console.log(`X API Rate Limit - Total limit: ${limit}`);
    }

    this.memoryCache.lastChecked = new Date();
    
    // Save to database
    await this.saveToDatabase();
  }

  /**
   * Check if we should skip the API due to rate limits
   */
  async shouldSkipRequest(): Promise<boolean> {
    // Load latest from database if we haven't checked recently
    if (!this.memoryCache.lastChecked || 
        (new Date().getTime() - this.memoryCache.lastChecked.getTime() > 60000)) { // 1 minute
      await this.loadFromDatabase();
    }
    
    // If we have remaining requests, allow it
    if (this.memoryCache.remainingRequests !== undefined && this.memoryCache.remainingRequests > 0) {
      return false;
    }
    
    // If we don't have rate limit info, assume we can make a request
    if (!this.memoryCache.resetTime) {
      return false;
    }
    
    // Check if reset time has passed
    const now = new Date();
    if (now > this.memoryCache.resetTime) {
      console.log('X API rate limit reset time has passed, allowing request');
      this.memoryCache.remainingRequests = 1; // Reset to free tier default
      await this.saveToDatabase();
      return false;
    }
    
    // Still rate limited
    const minutesUntilReset = Math.ceil((this.memoryCache.resetTime.getTime() - now.getTime()) / 1000 / 60);
    console.log(`X API rate limited. Reset in ${minutesUntilReset} minutes`);
    return true;
  }

  /**
   * Mark that we've been rate limited
   */
  async markRateLimited(resetTime?: Date): Promise<void> {
    this.memoryCache.remainingRequests = 0;
    if (resetTime) {
      this.memoryCache.resetTime = resetTime;
    } else {
      // Default to 15 minutes from now for free tier
      this.memoryCache.resetTime = new Date(Date.now() + 15 * 60 * 1000);
    }
    this.memoryCache.lastChecked = new Date();
    
    await this.saveToDatabase();
  }

  /**
   * Get current rate limit status
   */
  async getStatus(): Promise<{
    hasInfo: boolean;
    isRateLimited: boolean;
    remainingRequests: number;
    resetTime: string | null;
    resetTimeString: string | null;
    minutesUntilReset: number | null;
    message: string;
  }> {
    await this.loadFromDatabase();
    
    const now = new Date();
    const isCurrentlyRateLimited = await this.shouldSkipRequest();
    
    let minutesUntilReset = null;
    let resetTimeString = null;
    
    if (this.memoryCache.resetTime) {
      minutesUntilReset = Math.max(0, Math.ceil((this.memoryCache.resetTime.getTime() - now.getTime()) / 1000 / 60));
      resetTimeString = this.memoryCache.resetTime.toLocaleTimeString();
    }

    return {
      hasInfo: this.memoryCache.resetTime !== null,
      isRateLimited: isCurrentlyRateLimited,
      remainingRequests: this.memoryCache.remainingRequests || 0,
      resetTime: this.memoryCache.resetTime?.toISOString() || null,
      resetTimeString,
      minutesUntilReset,
      message: isCurrentlyRateLimited 
        ? `Rate limited. Resets in ${minutesUntilReset} minutes (${resetTimeString})`
        : `${this.memoryCache.remainingRequests || 1} requests remaining`
    };
  }
}

// Export singleton instance
export const xApiRateLimiter = new XApiRateLimitPersistent();