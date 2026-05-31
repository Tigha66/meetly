-- Meetly Row Level Security Policies
-- Run this migration after creating tables from SUPABASE_SCHEMA.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles: Hosts can read/write own profile; public can read public profiles
CREATE POLICY "Users can select own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can select public profiles"
  ON profiles FOR SELECT
  USING (is_public = true);

-- Event types: Hosts can CRUD own event types; public can read active/public ones
CREATE POLICY "Hosts can select own event types"
  ON event_types FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Hosts can insert own event types"
  ON event_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can update own event types"
  ON event_types FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can delete own event types"
  ON event_types FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can select active/public event types"
  ON event_types FOR SELECT
  USING (is_active = true AND is_public = true);

-- Availability rules: Hosts can CRUD own rules; public can read rules for active/public events
CREATE POLICY "Hosts can select own availability rules"
  ON availability_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Hosts can insert own availability rules"
  ON availability_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can update own availability rules"
  ON availability_rules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can delete own availability rules"
  ON availability_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Bookings: Hosts can select/update own bookings; public can insert bookings only through API
CREATE POLICY "Hosts can select own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = host_user_id);

CREATE POLICY "Hosts can delete own bookings"
  ON bookings FOR DELETE
  USING (auth.uid() = host_user_id);

-- NOTE: Public booking insert is handled via Server Action with admin client (bypasses RLS).
-- The bookings table does NOT have a public INSERT policy — guests book through /api/bookings.

-- Booking answers: Hosts can read answers for own bookings
CREATE POLICY "Hosts can select booking answers for own bookings"
  ON booking_answers FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE host_user_id = auth.uid()
    )
  );

-- Prevent double-booking: overlapping time constraint
-- This is a safety net; the application also validates server-side.
-- The constraint prevents two confirmed bookings for the same host at the same time.
-- Note: This requires the btree_gist extension.
-- CREATE EXTENSION IF NOT EXISTS btree_gist;
-- ALTER TABLE bookings ADD CONSTRAINT no_double_booking
--   EXCLUDE USING gist (
--     host_user_id WITH =,
--     tstzrange(start_time, end_time) WITH &&
--   ) WHERE (status IN ('confirmed', 'pending'));
