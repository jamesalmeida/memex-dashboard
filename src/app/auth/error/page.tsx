'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AuthError() {
  const [urlInfo, setUrlInfo] = useState<string>('')
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrlInfo(window.location.href)
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="mt-2 text-gray-600">There was an error signing you in. Please try again.</p>
        
        {urlInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-left">
            <p className="font-mono break-all">{urlInfo}</p>
          </div>
        )}
        
        <Link 
          href="/login" 
          className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}