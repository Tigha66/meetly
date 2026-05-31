import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Server-side Supabase client using the anon key (respects RLS).
 * Use this in Server Components and Server Actions.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  });
}

/**
 * Admin Supabase client using the service role key (bypasses RLS).
 * ONLY use for trusted server-side operations: profile bootstrap, admin tasks.
 * NEVER expose this client to the browser.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Get the current authenticated user from the server session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;
  return { id: user.id, email: user.email || '' };
}

/**
 * Assert that an authenticated user exists, returning their info.
 * Throws if not authenticated — use in protected server routes.
 */
export async function requireUser(): Promise<{ id: string; email: string }> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
