'use client';

import { useState } from 'react';
import { useXApiStatus } from '@/hooks/useXApiStatus';

export default function XApiStatus() {
  const { status, loading, refetch } = useXApiStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X API Status
            </h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Refresh rate limit status"
            >
              <svg 
                className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          {!status.configured ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Not configured. Add X API credentials to .env.local
            </p>
          ) : status.error ? (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {status.error}
            </p>
          ) : (
            <div className="mt-1">
              {status.isRateLimited ? (
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Rate limited
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Resets in {status.minutesUntilReset} min at {status.resetTimeString}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Active
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {status.remainingRequests} requests remaining
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {status.configured && !status.error && (
          <div className="flex items-center">
            {status.isRateLimited ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {status.minutesUntilReset}m
                </span>
              </div>
            ) : (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        )}
      </div>
      
      {status.configured && !status.error && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Free tier: 1 request / 15 min
          </p>
        </div>
      )}
    </div>
  );
}