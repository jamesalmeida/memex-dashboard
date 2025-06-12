'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { SignOutButton } from '@/components/SignOutButton';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface Item {
  id: string;
  title: string | null;
  url: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Load items
      const { data: items, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading items:', error);
      } else {
        setItems(items || []);
      }

      setLoading(false);
    };

    checkUserAndLoadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Memex Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
        </div>
        <SignOutButton />
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Your Items</h2>
        {items && items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="border-b pb-2">
                <div className="font-medium">{i.title ?? i.url ?? 'Untitled'}</div>
                <div className="text-sm text-gray-500">
                  {new Date(i.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No items yet. Start adding some!</p>
        )}
      </div>
    </main>
  );
}
