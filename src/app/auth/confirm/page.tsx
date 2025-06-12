'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthConfirm() {
  const router = useRouter()

  useEffect(() => {
    // Handle the hash fragment from Supabase
    if (typeof window !== 'undefined' && window.location.hash) {
      // The hash contains the tokens, redirect to home and let Supabase client handle it
      router.push('/')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Confirming your login...</h1>
        <p className="mt-2 text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  )
}