'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Wait a moment for Supabase to process the auth
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('Session found, redirecting to /everything')
          router.push('/everything')
          return
        }
        
        // If no session, check for errors in hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const hashError = hashParams.get('error')
        const hashErrorCode = hashParams.get('error_code')
        
        if (hashError || hashErrorCode) {
          console.error('Auth error:', hashError, hashErrorCode)
          router.push(`/login?error=${hashErrorCode || hashError || 'auth_failed'}`)
          return
        }
        
        // No session and no error - wait a bit more and try again
        console.log('No session yet, waiting...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session: sessionRetry } } = await supabase.auth.getSession()
        if (sessionRetry) {
          router.push('/everything')
        } else {
          console.error('No session after retry')
          router.push('/login?error=no_session')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/login?error=callback_error')
      }
    }
    
    handleAuth()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Authenticating...</h1>
        <p className="mt-2 text-gray-600">Please wait while we complete your sign in.</p>
      </div>
    </div>
  )
}