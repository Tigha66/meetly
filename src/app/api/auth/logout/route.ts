import { NextResponse } from 'next/server';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export async function POST() {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true }, {
    headers: {
      'Set-Cookie': 'sb-access-token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
    },
  });
}
