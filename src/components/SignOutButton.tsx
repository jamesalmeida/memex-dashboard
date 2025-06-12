'use client'

import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
    >
      Sign Out
    </button>
  )
}