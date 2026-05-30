
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  timezone: string;
  slug: string;
};

export type EventType = {
  id: string;
  name: string;
  slug: string;
  duration_minutes: number;
  description: string;
  color: string;
  is_active: boolean;
};

export type Booking = {
  id: string;
  event_type_id: string;
  guest_name: string;
  guest_email: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled';
};
