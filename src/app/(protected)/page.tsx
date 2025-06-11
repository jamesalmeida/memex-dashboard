// src/app/(protected)/page.tsx
import { supabaseServer } from '@/utils/supabaseServer';

export default async function Dashboard() {
  const supabase = supabaseServer();
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Memex dashboard</h1>
      <ul className="mt-6 space-y-2">
        {items?.map((i) => (
          <li key={i.id} className="list-disc ml-6">
            {i.title ?? i.url ?? 'Untitled'} —{' '}
            {new Date(i.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </main>
  );
}
