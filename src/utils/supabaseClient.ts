import { createClient } from '@supabase/supabase-js'

// Determine the app URL based on environment
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current window location
    return window.location.origin
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      redirectTo: getAppUrl() + '/auth/callback'
    }
  }
)