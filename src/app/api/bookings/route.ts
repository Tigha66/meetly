
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type_id, host_id, guest_name, guest_email, startTime, endTime, notes } = body;

    if (!event_type_id || !host_id || !guest_name || !guest_email || !startTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        event_type_id,
        host_id,
        guest_name,
        guest_email,
        start_time: startTime,
        end_time: endTime,
        guest_notes: notes,
        status: 'confirmed'
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, booking: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
