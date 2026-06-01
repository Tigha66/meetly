
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * Public booking availability endpoint.
 *
 * Purpose:
 * - Provide ONLY blocking fields needed by the public booking UI.
 * - Never expose guest PII.
 *
 * Query params:
 *   - hostId: host profile UUID
 *   - from: ISO datetime (range start)
 *   - to: ISO datetime (range end)
 *
 * Response shape (must match frontend):
 *   { bookings: Array<{ start_time: string; end_time: string }> }
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

  // Validate date params
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return NextResponse.json(
      {
        error: 'INVALID_PARAMS',
        message: 'Invalid date params: from/to must be ISO datetimes.',
      },
      { status: 400 }
    );
  }
  if (fromDate.getTime() >= toDate.getTime()) {
    return NextResponse.json(
      { error: 'INVALID_PARAMS', message: '`from` must be earlier than `to`.' },
      { status: 400 }
    );
  }

  // Supabase configuration check
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json(
      {
        error: 'SUPABASE_NOT_CONFIGURED',
        message: 'Supabase is not configured.',
      },
      { status: 503 }
    );
  }

  try {
    // Server-only admin client (service role); RLS bypassed.
    // We must scope tightly by host and time range.
    const supabase = getSupabaseAdminClient();

    // Overlap condition: existing.start < rangeEnd AND existing.end > rangeStart
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('host_id', hostId)
      .in('status', ['pending', 'confirmed'])
      .lt('start_time', to)
      .gt('end_time', from)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('[API] bookings availability error:', error);
      // Best-effort: slot blocking is non-critical for rendering the booking page.
      // Return an empty list rather than failing hard.
      return NextResponse.json({ bookings: [] });
    }

    // Response shape required by the booking UI
    return NextResponse.json({ bookings: bookings || [] });
  } catch (err) {
    console.error('[API] bookings availability exception:', err);
    // Best-effort: return an empty list rather than crashing the public UI.
    return NextResponse.json({ bookings: [] });
  }
}
