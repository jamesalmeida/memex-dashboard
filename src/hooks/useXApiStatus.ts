import { useState, useEffect, useCallback } from 'react';

interface XApiStatus {
  configured: boolean;
  isRateLimited: boolean;
  remainingRequests: number;
  resetTimeString: string;
  minutesUntilReset: number;
}

interface StoredRateLimit {
  isRateLimited: boolean;
  resetTime: string | null;
  remainingRequests: number;
  lastChecked: string;
}

const RATE_LIMIT_STORAGE_KEY = 'x-api-rate-limit';
const CHECK_INTERVAL = 60 * 1000; // 1 minute

export function useXApiStatus() {
  const [status, setStatus] = useState<XApiStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Load rate limit info from localStorage
  const loadStoredRateLimit = useCallback((): StoredRateLimit | null => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stored rate limit:', error);
    }
    return null;
  }, []);

  // Save rate limit info to localStorage
  const saveRateLimit = useCallback((data: XApiStatus) => {
    try {
      const toStore: StoredRateLimit = {
        isRateLimited: data.isRateLimited,
        resetTime: data.resetTimeString,
        remainingRequests: data.remainingRequests,
        lastChecked: new Date().toISOString()
      };
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Error saving rate limit:', error);
    }
  }, []);

  // Calculate status from stored data
  const calculateStatusFromStored = useCallback((stored: StoredRateLimit): XApiStatus | null => {
    if (!stored.resetTime) return null;
    
    const now = new Date();
    const resetTime = new Date(stored.resetTime);
    const minutesUntilReset = Math.max(0, Math.ceil((resetTime.getTime() - now.getTime()) / 1000 / 60));
    
    // If reset time has passed, we're no longer rate limited
    const isStillRateLimited = stored.isRateLimited && resetTime > now;
    
    return {
      configured: true,
      isRateLimited: isStillRateLimited,
      remainingRequests: isStillRateLimited ? 0 : 15, // X API Basic tier: 15 requests per 15 minutes after reset
      resetTimeString: stored.resetTime,
      minutesUntilReset
    };
  }, []);

  const fetchStatus = useCallback(async (forceCheck = false) => {
    // First check localStorage
    const stored = loadStoredRateLimit();
    
    if (stored && !forceCheck) {
      const calculatedStatus = calculateStatusFromStored(stored);
      if (calculatedStatus && calculatedStatus.isRateLimited) {
        // If we're rate limited according to stored data, don't make an API call
        console.log('X API rate limited (from localStorage), skipping API check');
        setStatus(calculatedStatus);
        setLoading(false);
        return;
      }
    }

    // Only make API call if we're not rate limited or if forced
    console.log(forceCheck ? 'Force checking X API status...' : 'Checking X API status...');
    try {
      const url = forceCheck ? '/api/x-api-status?force=true' : '/api/x-api-status';
      const response = await fetch(url);
      const data = await response.json();
      setStatus(data);
      
      // Save to localStorage if we got valid data
      if (data && data.configured) {
        saveRateLimit(data);
      }
    } catch (error) {
      console.error('Failed to fetch X API status:', error);
      
      // Fall back to stored data if available
      if (stored) {
        const calculatedStatus = calculateStatusFromStored(stored);
        if (calculatedStatus) {
          setStatus(calculatedStatus);
        } else {
          setStatus(null);
        }
      } else {
        setStatus(null);
      }
    } finally {
      setLoading(false);
    }
  }, [loadStoredRateLimit, calculateStatusFromStored, saveRateLimit]);

  useEffect(() => {
    // Initial load - only check stored data first
    const stored = loadStoredRateLimit();
    if (stored) {
      const calculatedStatus = calculateStatusFromStored(stored);
      if (calculatedStatus) {
        setStatus(calculatedStatus);
        setLoading(false);
        
        // Only fetch from API if we're not rate limited and it's been a while
        const lastChecked = new Date(stored.lastChecked);
        const timeSinceLastCheck = Date.now() - lastChecked.getTime();
        
        if (!calculatedStatus.isRateLimited && timeSinceLastCheck > 5 * 60 * 1000) {
          fetchStatus();
        }
        return;
      }
    }
    
    // No stored data, fetch from API to get accurate info
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps, only run once on mount
  
  useEffect(() => {
    // Set up interval that only updates UI from stored data
    const interval = setInterval(() => {
      const stored = loadStoredRateLimit();
      
      if (stored) {
        // Just update the UI based on stored data - no API calls
        const calculatedStatus = calculateStatusFromStored(stored);
        if (calculatedStatus) {
          setStatus(calculatedStatus);
        }
      }
    }, CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [loadStoredRateLimit, calculateStatusFromStored]);

  return { status, loading, refetch: () => fetchStatus(true) };
}