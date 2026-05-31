/**
 * Validate that all required Supabase environment variables are present.
 * Returns an object with { valid: boolean, error?: string }
 */
export function validateSupabaseEnv(): { valid: boolean; error?: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url && !key) {
    return {
      valid: false,
      error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.',
    };
  }
  if (!url) {
    return {
      valid: false,
      error: 'Missing NEXT_PUBLIC_SUPABASE_URL. Get it from Supabase → Settings → API.',
    };
  }
  if (!key) {
    return {
      valid: false,
      error: 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Get it from Supabase → Settings → API.',
    };
  }
  return { valid: true };
}
