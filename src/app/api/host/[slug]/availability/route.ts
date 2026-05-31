import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      {
        error: 'SUPABASE_NOT_CONFIGURED',
        message:
          'Supabase is not configured. The site owner needs to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      },
      { status: 503 }
    );
  }

  try {
    const supabase = await getSupabaseServerClient();

    // First get the host profile to find their id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (profileError) {
      console.error('[API] Host lookup error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch host' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'HOST_NOT_FOUND', message: 'Host not found' },
        { status: 404 }
      );
    }

    // Fetch availability rules for this host
    const { data: rules, error } = await supabase
      .from('availability_rules')
      .select('id, host_id, day_of_week, start_time, end_time, is_enabled')
      .eq('host_id', profile.id);

    if (error) {
      console.error('[API] Availability error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({ rules: rules || [] });
  } catch (err) {
    console.error('[API] Availability exception:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
