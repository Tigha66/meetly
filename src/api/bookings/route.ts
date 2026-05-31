import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Fetch confirmed bookings for a host within a time range.
 * Used by the booking page to check slot availability.
 *
 * Query params:
 *   - hostId: the host's profile UUID
 *   - from: ISO start time
 *   - to: ISO end time
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hostId = searchParams.get('hostId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!hostId || !from || !to) {
    return NextResponse.json(
      { error: 'Missing required params: hostId, from, to' },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      {
        error: 'SUPABASE_NOT_CONFIGURED',
        message: 'Supabase is not configured.',
      },
      { status: 503 }
    );
  }

  try {
    const supabase = await getSupabaseServerClient();

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, start_time, end_time')
      .eq('host_id', hostId)
      .eq('status', 'confirmed')
      .gte('start_time', from)
      .lte('start_time', to);

    if (error) {
      console.error('[API] Bookings error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (err) {
    console.error('[API] Bookings exception:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
