import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * Check which time slots are unavailable for a host within a range.
 * Returns only slot start times — no guest data exposed.
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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || !serviceKey) {
    return NextResponse.json(
      {
        error: 'SUPABASE_NOT_CONFIGURED',
        message: 'Supabase is not configured.',
      },
      { status: 503 }
    );
  }

  try {
    // Use admin client — this API uses service role key (server-side only)
    // RLS is bypassed; we scope by host_id in the query itself
    const supabase = getSupabaseAdminClient();

    const { data: slots, error } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('host_id', hostId)
      .eq('status', 'confirmed')
      .gte('start_time', from)
      .lte('start_time', to);

    if (error) {
      console.error('[API] Slot check error:', error);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({ slots: slots || [] });
  } catch (err) {
    console.error('[API] Slot check exception:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
