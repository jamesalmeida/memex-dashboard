'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the hash fragment which contains the access token
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('Hash params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          fullHash: window.location.hash
        })

        // If we have tokens in the hash, set the session
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Error setting session:', error)
            router.push('/login?error=auth_failed')
            return
          }
          
          console.log('Session set successfully')
          router.push('/everything')
          return
        }

        // Check for error in URL params
        const urlParams = new URLSearchParams(window.location.search)
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')
        
        if (error) {
          console.error('Auth error:', error, errorDescription)
          router.push(`/login?error=${error}`)
          return
        }

        // If no tokens and no error, check if session already exists
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('Existing session found')
          router.push('/everything')
        } else {
          console.error('No auth tokens found')
          router.push('/login?error=no_tokens')
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