-- Migration 003: Booking answers table + add bio to profiles + final cleanup
--
-- This migration:
-- 1. Adds `bio` column to profiles (used by Phase 1B settings page)
-- 2. Creates the `booking_answers` table (referenced in migration 002 RLS)
-- 3. Adds RLS to booking_answers

-- Add bio column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- Create booking_answers table
CREATE TABLE IF NOT EXISTS booking_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on booking_answers (if table was just created)
ALTER TABLE booking_answers ENABLE ROW LEVEL SECURITY;

-- Booking answers: hosts can read answers for their bookings
CREATE POLICY "Hosts can read answers for own bookings"
  ON booking_answers FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE host_id = auth.uid()
    )
  );
