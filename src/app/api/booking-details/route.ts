
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hostSlug = searchParams.get('hostSlug');
  const eventSlug = searchParams.get('eventSlug');

  if (!hostSlug || !eventSlug) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // 1. Get host profile
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .eq('slug', hostSlug)
      .single();

    if (pError || !profile) return NextResponse.json({ error: 'Host not found' }, { status: 404 });

    // 2. Get event type
    const { data: event, error: eError } = await supabase
      .from('event_types')
      .select('*')
      .eq('slug', eventSlug)
      .eq('host_id', profile.id)
      .single();

    if (eError || !event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    // 3. Get availability
    const { data: availability } = await supabase
      .from('availability_rules')
      .select('*')
      .eq('host_id', profile.id)
      .order('day_of_week', { ascending: true });

    return NextResponse.json({
      host: profile,
      event: event,
      availability: availability || [],
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
