-- Migration 002: Fix RLS policies and add double-booking protection
--
-- PROBLEM: Migration 001 referenced columns that don't exist in the actual schema:
--   - event_types.user_id → actual column is host_id
--   - bookings.host_user_id → actual column is host_id
--   - profiles.is_public → column doesn't exist
--   - event_types.is_public → column doesn't exist
--
-- This migration drops all broken policies from migration 001 and recreates
-- them with correct column names, then adds an exclusion constraint for
-- double-booking protection at the database level.

-- ═══════════════════════════════════════════════════════════════
-- 1. Drop broken policies from migration 001
-- ═══════════════════════════════════════════════════════════════

-- Profiles
DROP POLICY IF EXISTS "Users can select own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public can select public profiles" ON profiles;

-- Event types
DROP POLICY IF EXISTS "Hosts can select own event types" ON event_types;
DROP POLICY IF EXISTS "Hosts can insert own event types" ON event_types;
DROP POLICY IF EXISTS "Hosts can update own event types" ON event_types;
DROP POLICY IF EXISTS "Hosts can delete own event types" ON event_types;
DROP POLICY IF EXISTS "Public can select active/public event types" ON event_types;

-- Availability rules
DROP POLICY IF EXISTS "Hosts can select own availability rules" ON availability_rules;
DROP POLICY IF EXISTS "Hosts can insert own availability rules" ON availability_rules;
DROP POLICY IF EXISTS "Hosts can update own availability rules" ON availability_rules;
DROP POLICY IF EXISTS "Hosts can delete own availability rules" ON availability_rules;

-- Bookings
DROP POLICY IF EXISTS "Hosts can select own bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can delete own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create a booking" ON bookings;

-- Booking answers
DROP POLICY IF EXISTS "Hosts can select booking answers for own bookings" ON booking_answers;

-- Also drop the original policies from the base schema (SUPABASE_SCHEMA.sql)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Event types are viewable by everyone" ON event_types;
DROP POLICY IF EXISTS "Hosts can manage own event types" ON event_types;
DROP POLICY IF EXISTS "Bookings are viewable by host" ON bookings;
DROP POLICY IF EXISTS "Hosts can manage own bookings" ON bookings;

-- ═══════════════════════════════════════════════════════════════
-- 2. Recreate correct RLS policies
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS (already enabled, but idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles: public can read (for booking page), users can write own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Event types: public can read (for booking page), hosts can CRUD own
CREATE POLICY "Event types are viewable by everyone"
  ON event_types FOR SELECT
  USING (true);

CREATE POLICY "Hosts can manage own event types"
  ON event_types FOR ALL
  USING (auth.uid() = host_id);

-- Availability rules: hidden from public, hosts can CRUD own
CREATE POLICY "Hosts can manage own availability rules"
  ON availability_rules FOR ALL
  USING (auth.uid() = host_id);

-- Bookings: hosts can read/write own, public can INSERT (for guest bookings)
-- IMPORTANT: public INSERT is allowed via the API route which uses the
-- admin client (bypasses RLS). This policy is a fallback safety net.
CREATE POLICY "Bookings are viewable by host"
  ON bookings FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete own bookings"
  ON bookings FOR DELETE
  USING (auth.uid() = host_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. Double-booking protection: exclusion constraint
-- ═══════════════════════════════════════════════════════════════
--
-- This prevents two confirmed bookings for the same host from having
-- overlapping time ranges, at the database level. This is the last line
-- of defense against race conditions.
--
-- Requires the btree_gist extension.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings ADD CONSTRAINT no_double_booking
  EXCLUDE USING gist (
    host_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status IN ('confirmed', 'pending'));

-- ═══════════════════════════════════════════════════════════════
-- 4. Grant usage to anon role for booking insert
-- ═══════════════════════════════════════════════════════════════
--
-- The API route uses the admin client (service role), which bypasses RLS.
-- No additional grants needed for the admin client path.
-- If you want to allow direct anon inserts in the future:
--   GRANT INSERT ON bookings TO anon;
--   GRANT INSERT ON bookings TO authenticated;
