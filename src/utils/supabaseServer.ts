import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Returns a Supabase client scoped to this server component request
export const supabaseServer = () =>
  createServerComponentClient({ cookies })