// src/app/(protected)/layout.tsx
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/utils/supabaseServer';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { user },
  } = await supabaseServer().auth.getUser();

  if (!user) {
    // not logged in? send to login page
    redirect('/login');
  }

  return <>{children}</>;
}
