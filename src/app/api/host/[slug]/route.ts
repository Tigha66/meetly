import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Missing host slug' }, { status: 400 });
  }

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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, timezone, slug')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[API] Host lookup error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch host profile' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'HOST_NOT_FOUND', message: 'Host not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[API] Host lookup exception:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
