'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      const errorMessages: { [key: string]: string } = {
        'auth_failed': 'Authentication failed. Please try again.',
        'no_session': 'No session found. Please sign in again.',
        'callback_error': 'An error occurred during authentication.',
        'no_code': 'Invalid authentication link. Please request a new one.',
        'no_tokens': 'No authentication tokens found. Please request a new magic link.',
        'access_denied': 'Access denied. Please try again.',
        'server_error': 'Server error. Please try again later.',
        'otp_expired': 'Your magic link has expired. Please request a new one.'
      }
      setMessage({ type: 'error', text: errorMessages[error] || 'An error occurred.' })
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Get the current URL, handling both localhost ports
    const redirectTo = window.location.origin + '/auth/callback'
    console.log('Login - Sending magic link with redirect URL:', redirectTo)
    console.log('Current origin:', window.location.origin)
    console.log('Full URL:', window.location.href)
    
    // Log the Supabase URL to verify we're using the right project
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: redirectTo,
      }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Check your email for the magic link!' })
    }
    
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to Memex</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a magic link
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
          />
          
          <button 
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>

          {message && (
            <p className={`text-center text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl">Loading...</h2>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}