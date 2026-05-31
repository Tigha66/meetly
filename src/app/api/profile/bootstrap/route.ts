import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/bootstrap
 * Creates or updates a user profile after signup.
 * Uses the admin client (service role) to bypass RLS for initial profile creation.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ ok: true, message: 'Profile already exists' });
    }

    // Generate a unique slug from email prefix
    const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (true) {
      const { data: slugCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!slugCheck) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName || email.split('@')[0],
      slug,
      timezone: 'UTC',
      is_public: true,
    });

    if (error) {
      console.error('Profile bootstrap error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, slug });
  } catch (err: any) {
    console.error('Profile bootstrap API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
