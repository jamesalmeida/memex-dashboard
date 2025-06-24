// Performance monitoring utilities

export const performance = {
  // Measure time to first byte
  measureTTFB: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const nav = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (nav) {
        return nav.responseStart - nav.requestStart
      }
    }
    return null
  },

  // Measure hydration time
  measureHydration: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const nav = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (nav) {
        return nav.loadEventEnd - nav.responseEnd
      }
    }
    return null
  },

  // Log Supabase query metrics
  logQuery: (queryName: string, startTime: number) => {
    const duration = Date.now() - startTime
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Supabase Query] ${queryName}: ${duration}ms`)
    }
    
    // Send to analytics in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: queryName,
        value: duration,
        event_category: 'Supabase Query'
      })
    }
  },

  // Monitor cache hit rates
  logCacheHit: (cacheKey: string, hit: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cache] ${cacheKey}: ${hit ? 'HIT' : 'MISS'}`)
    }
    
    // Track cache performance
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cache_access', {
        cache_key: cacheKey,
        cache_hit: hit,
        event_category: 'Performance'
      })
    }
  }
}

// Auto-log performance metrics on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const ttfb = performance.measureTTFB()
    const hydration = performance.measureHydration()
    
    if (ttfb !== null) {
      console.log(`[Performance] TTFB: ${ttfb}ms`)
    }
    
    if (hydration !== null) {
      console.log(`[Performance] Hydration: ${hydration}ms`)
    }
  })
}