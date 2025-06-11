import { supabase } from '@/lib/supabaseClient'

export default async function Home() {
  // simple ping: read current time from Supabase
  const { data, error } = await supabase.rpc('now')
  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Memex dashboard</h1>
      <p>Supabase says it is: {data ?? error?.message}</p>
    </main>
  )
}

