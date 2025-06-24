# Data Fetching & Caching Strategy

## Overview

This document describes the optimized data-fetching and caching strategy implemented to reduce Supabase egress and improve performance.

## Key Improvements

### 1. Removed `raw_text` from List Queries
- **Before**: All item queries used `select('*')` which included the large `raw_text` field
- **After**: List queries now explicitly select only needed fields, excluding `raw_text`
- **Impact**: ~90% reduction in data transfer for list views

### 2. Server-Side Rendering with ISR
- **Implementation**: Dashboard page converted to server component with `revalidate = 60`
- **Benefits**: 
  - Initial data fetched server-side (faster first paint)
  - Cached for 60 seconds on Vercel's edge network
  - No client-side data fetching on initial load

### 3. SWR Client-Side Caching
- **Configuration**: 
  - `dedupingInterval: 60000` - Deduplicates requests within 1 minute
  - `revalidateOnFocus: false` - Prevents refetch on tab focus
  - `revalidateOnReconnect: false` - Prevents refetch on reconnect
- **Benefits**: Navigation between pages reuses cached data

### 4. Optimized Pagination
- **Implementation**: Using `useSWRInfinite` with 20 items per page
- **Benefits**: Only loads data as user scrolls

### 5. Real-Time Selective Updates
- **Implementation**: Supabase realtime subscriptions update only affected items
- **Benefits**: No full page refetches on data changes

### 6. Component Optimization
- **ItemCard** and **SpaceCard** wrapped with `React.memo`
- Custom comparison functions prevent unnecessary re-renders

### 7. Edge Caching Headers
- API routes return `Cache-Control: s-maxage=60, stale-while-revalidate=86400`
- Vercel CDN caches responses for anonymous users

## Performance Metrics

### Before Optimization
- Every page navigation = full database read
- List views fetched ALL columns including `raw_text`
- Egress: >5GB/month

### After Optimization
- First load: Server-side rendered with ISR cache
- Subsequent navigation: Uses SWR cache (no DB hits)
- List views: Only essential fields (no `raw_text`)
- Expected egress: <500MB/month

## Monitoring

To verify the improvements:

1. **Supabase Dashboard**
   - Check API Logs for query frequency
   - Monitor bandwidth usage

2. **Browser DevTools**
   - Network tab should show cached responses
   - No duplicate requests within 60 seconds

3. **Vercel Analytics**
   - Monitor edge cache hit rates
   - Check TTFB metrics

## Future Optimizations

1. Implement database-level caching with Redis
2. Add query result caching in Supabase functions
3. Implement more granular cache invalidation
4. Add CDN for static assets