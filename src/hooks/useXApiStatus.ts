import { useState, useEffect } from 'react';

interface XApiStatus {
  configured: boolean;
  isRateLimited: boolean;
  remainingRequests: number;
  resetTimeString: string;
  minutesUntilReset: number;
}

export function useXApiStatus() {
  const [status, setStatus] = useState<XApiStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/x-api-status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch X API status:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { status, loading, refetch: fetchStatus };
}