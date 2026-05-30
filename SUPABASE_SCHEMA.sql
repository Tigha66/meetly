
/**
 * Meetly Data Model
 * Implementation Target: Supabase (PostgreSQL)
 */

-- Users Table (Managed by Supabase Auth)
-- profiles table extends auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  slug TEXT UNIQUE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Types
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g., "15-minute intro call"
  slug TEXT NOT NULL, -- e.g., "intro-call"
  duration_minutes INTEGER NOT NULL, -- e.g., 15, 30, 60
  description TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(host_id, slug)
);

-- Availability Rules (Weekly pattern)
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 (Sunday) to 6 (Saturday)
  start_time TIME NOT NULL, -- e.g., '09:00:00'
  end_time TIME NOT NULL,   -- e.g., '17:00:00'
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE NOT NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_notes TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'confirmed', -- 'confirmed', 'cancelled'
  google_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Calendar Connections
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies (Basic)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event types are viewable by everyone" ON event_types FOR SELECT USING (true);
CREATE POLICY "Hosts can manage own event types" ON event_types FOR ALL USING (auth.uid() = host_id);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bookings are viewable by host" ON bookings FOR SELECT USING (auth.uid() = host_id);
CREATE POLICY "Anyone can create a booking" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Hosts can manage own bookings" ON bookings FOR ALL USING (auth.uid() = host_id);
