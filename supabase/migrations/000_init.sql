-- Meetly Database Initialization (Consolidated)
-- Run this in a fresh Supabase project SQL Editor

-- ═══════════════════════════════════════════════════════════════
-- 1. Extensions
-- ═══════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ═══════════════════════════════════════════════════════════════
-- 2. Tables
-- ═══════════════════════════════════════════════════════════════

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Types
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(host_id, slug)
);

-- Availability Rules (Weekly pattern)
CREATE TABLE IF NOT EXISTS availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE NOT NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_notes TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  google_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Calendar Connections
CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Booking Answers
CREATE TABLE IF NOT EXISTS booking_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. Constraints
-- ═══════════════════════════════════════════════════════════════

-- Double-booking protection: prevent overlapping confirmed/pending bookings for same host
ALTER TABLE bookings
  ADD CONSTRAINT no_double_booking
  EXCLUDE USING gist (
    host_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status IN ('confirmed', 'pending'));

-- ═══════════════════════════════════════════════════════════════
-- 4. RLS Policies
-- ═══════════════════════════════════════════════════════════════

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Event Types
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event types are viewable by everyone"
  ON event_types FOR SELECT USING (true);

CREATE POLICY "Hosts can manage own event types"
  ON event_types FOR ALL
  USING (auth.uid() = host_id);

-- Availability Rules
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can manage own availability rules"
  ON availability_rules FOR ALL
  USING (auth.uid() = host_id);

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bookings are viewable by host"
  ON bookings FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete own bookings"
  ON bookings FOR DELETE
  USING (auth.uid() = host_id);

-- Booking Answers
ALTER TABLE booking_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can read answers for own bookings"
  ON booking_answers FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE host_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 5. Indexes
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_event_types_host_id ON event_types(host_id);
CREATE INDEX IF NOT EXISTS idx_event_types_slug ON event_types(slug);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_type_id ON bookings(event_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_availability_rules_host_id ON availability_rules(host_id);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);
CREATE INDEX IF NOT EXISTS idx_booking_answers_booking_id ON booking_answers(booking_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. Functions & Triggers
-- ═══════════════════════════════════════════════════════════════

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
