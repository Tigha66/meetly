import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { addMinutes, parseISO, isBefore, isEqual } from 'date-fns';

interface CreateBookingBody {
  host_id: string;
  event_type_id: string;
  guest_name: string;
  guest_email: string;
  guest_notes?: string;
  start_time: string; // ISO
  end_time: string;   // ISO
}

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || !serviceKey) {
    return NextResponse.json(
      {
        error: 'SUPABASE_NOT_CONFIGURED',
        message:
          'The booking system is not yet fully configured. The site owner needs to connect the database.',
      },
      { status: 503 }
    );
  }

  // ── Parse body ──
  let body: CreateBookingBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const {
    host_id,
    event_type_id,
    guest_name,
    guest_email,
    guest_notes,
    start_time,
    end_time,
  } = body;

  // ── Required field validation ──
  if (!host_id) {
    return NextResponse.json(
      { error: 'MISSING_HOST', message: 'Host is required.' },
      { status: 400 }
    );
  }
  if (!event_type_id) {
    return NextResponse.json(
      { error: 'MISSING_EVENT_TYPE', message: 'Event type is required.' },
      { status: 400 }
    );
  }
  if (!guest_name || !guest_name.trim()) {
    return NextResponse.json(
      { error: 'MISSING_NAME', message: 'Your name is required.' },
      { status: 400 }
    );
  }
  if (!guest_email || !guest_email.trim() || !guest_email.includes('@')) {
    return NextResponse.json(
      { error: 'INVALID_EMAIL', message: 'A valid email address is required.' },
      { status: 400 }
    );
  }
  if (!start_time || !end_time) {
    return NextResponse.json(
      { error: 'MISSING_TIME', message: 'Start and end time are required.' },
      { status: 400 }
    );
  }

  let startTime: Date;
  let endTime: Date;
  try {
    startTime = parseISO(start_time);
    endTime = parseISO(end_time);
  } catch {
    return NextResponse.json(
      { error: 'INVALID_TIME', message: 'Invalid date format.' },
      { status: 400 }
    );
  }

  if (!isBefore(startTime, endTime)) {
    return NextResponse.json(
      { error: 'INVALID_RANGE', message: 'End time must be after start time.' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();

  // ── Validate host exists ──
  const { data: host, error: hostErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', host_id)
    .maybeSingle();

  if (hostErr) {
    console.error('[Booking API] Host lookup error:', hostErr);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
  if (!host) {
    return NextResponse.json(
      { error: 'HOST_NOT_FOUND', message: 'Host not found.' },
      { status: 404 }
    );
  }

  // ── Validate event type exists, belongs to host, and is active ──
  const { data: eventType, error: evtErr } = await supabase
    .from('event_types')
    .select('id, host_id, is_active, duration_minutes')
    .eq('id', event_type_id)
    .maybeSingle();

  if (evtErr) {
    console.error('[Booking API] Event type lookup error:', evtErr);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
  if (!eventType) {
    return NextResponse.json(
      { error: 'EVENT_NOT_FOUND', message: 'Event type not found.' },
      { status: 404 }
    );
  }
  if (eventType.host_id !== host_id) {
    return NextResponse.json(
      { error: 'EVENT_WRONG_HOST', message: 'This event type does not belong to this host.' },
      { status: 400 }
    );
  }
  if (!eventType.is_active) {
    return NextResponse.json(
      { error: 'EVENT_INACTIVE', message: 'This event type is no longer available.' },
      { status: 400 }
    );
  }

  // ── Validate booking duration matches event type duration ──
  const actualDurationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
  if (actualDurationMinutes !== eventType.duration_minutes) {
    return NextResponse.json(
      { error: 'DURATION_MISMATCH', message: 'Booking duration does not match event type duration.' },
      { status: 400 }
    );
  }

  // ── Validate slot is inside host availability ──
  const dayOfWeek = startTime.getDay();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const startTimeStr = `${pad(startTime.getHours())}:${pad(startTime.getMinutes())}:00`;
  const endTimeStr = `${pad(endTime.getHours())}:${pad(endTime.getMinutes())}:00`;

  const { data: availRules, error: availErr } = await supabase
    .from('availability_rules')
    .select('start_time, end_time')
    .eq('host_id', host_id)
    .eq('day_of_week', dayOfWeek)
    .eq('is_enabled', true);

  if (availErr) {
    console.error('[Booking API] Availability lookup error:', availErr);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }

  const isInAvailability = (availRules || []).some((rule: { start_time: string; end_time: string }) => {
    return startTimeStr >= rule.start_time && endTimeStr <= rule.end_time;
  });

  if (!isInAvailability) {
    return NextResponse.json(
      { error: 'OUTSIDE_AVAILABILITY', message: 'The selected time is outside the host\'s availability.' },
      { status: 400 }
    );
  }

  // ── Validate slot is not in the past ──
  const now = new Date();
  if (isBefore(startTime, now) || isEqual(startTime, now)) {
    return NextResponse.json(
      { error: 'PAST_SLOT', message: 'Cannot book a time in the past.' },
      { status: 400 }
    );
  }

  // ── Double-booking check: overlapping confirmed bookings ──
  // Overlap condition: existing.start < new.end AND existing.end > new.start
  const { data: overlapping, error: overlapErr } = await supabase
    .from('bookings')
    .select('id')
    .eq('host_id', host_id)
    .eq('status', 'confirmed')
    .lt('start_time', end_time)
    .gt('end_time', start_time)
    .limit(1);

  if (overlapErr) {
    console.error('[Booking API] Overlap check error:', overlapErr);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }

  if (overlapping && overlapping.length > 0) {
    return NextResponse.json(
      { error: 'SLOT_TAKEN', message: 'This time slot was just taken. Please select another time.' },
      { status: 409 }
    );
  }

  // ── Create the booking ──
  const { data: booking, error: insertErr } = await supabase
    .from('bookings')
    .insert({
      event_type_id,
      host_id,
      guest_name: guest_name.trim(),
      guest_email: guest_email.trim(),
      guest_notes: (guest_notes || '').trim(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
    })
    .select('id, start_time, end_time, status')
    .single();

  if (insertErr) {
    console.error('[Booking API] Insert error:', insertErr);

    // Check if it's a double-booking constraint violation (in case of race condition)
    if (insertErr.code === '23P01') {
      // exclusion constraint violation
      return NextResponse.json(
        { error: 'SLOT_TAKEN', message: 'This time slot was just taken. Please select another time.' },
        { status: 409 }
      );
    }
    // Check unique violation or other constraint errors
    if (insertErr.code === '23505') {
      return NextResponse.json(
        { error: 'DUPLICATE_BOOKING', message: 'This booking already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Failed to create booking. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      booking,
      message: 'Booking confirmed.',
    },
    { status: 201 }
  );
}
