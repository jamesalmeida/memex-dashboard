'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // First, let's check if there's already a session
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      
      if (existingSession) {
        console.log('Session already exists, redirecting...')
        router.push('/everything')
        return
      }

      // If no session, wait for Supabase to handle the auth callback
      console.log('Waiting for auth to complete...')
      
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth event:', event, 'Session:', !!session)
        
        if (event === 'SIGNED_IN' && session) {
          router.push('/everything')
        } else if (event === 'USER_UPDATED' && session) {
          router.push('/everything')
        }
      })

      // Also check again after a delay
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/everything')
        } else {
          console.error('No session after timeout')
          router.push('/login?error=auth_failed')
        }
      }, 2000)

      return () => {
        subscription.unsubscribe()
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