'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.search)
        
        if (error) {
          console.error('Auth exchange error:', error)
          router.push('/login?error=auth_failed')
          return
        }
        
        // Check if we now have a session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.error('No session after exchange')
          router.push('/login?error=no_session')
          return
        }
        
        // Success! Redirect to everything
        router.push('/everything')
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/login?error=callback_error')
      }
    }
    
    handleRedirect()
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