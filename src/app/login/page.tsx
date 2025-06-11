'use client'
import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await supabase.auth.signInWithOtp({ email })
    alert('Check your email for the magic link')
  }

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <input
        className="border p-2 mr-2"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <button className="border px-4 py-2">Send link</button>
    </form>
  )
}