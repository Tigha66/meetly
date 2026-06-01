# Next Actions

## Highest Priority — Live Supabase Verification Gate

**Phase 1E will NOT be accepted until ALL of the following are completed.**

### Step 1: Configure Vercel Environment Variables
Set in Vercel → Project → Settings → Environment Variables:

| Variable | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role) | Production only (server-side) |
| `NEXT_PUBLIC_APP_URL` | `https://meetly-6vwn.vercel.app` | Production |

⚠️ CRITICAL: `SUPABASE_SERVICE_ROLE_KEY` must NEVER be prefixed with `NEXT_PUBLIC_`.
It must NEVER be imported into any client component.
If it appears in any file with `'use client'`, that is a security breach — rotate the key immediately.

Redeploy on Vercel after adding env vars.

### Step 2: Apply SQL Migrations to Live Supabase
In Supabase SQL Editor, run in order:
1. `supabase/migrations/001_rls_policies.sql`
2. `supabase/migrations/002_fix_rls_and_constraints.sql`
3. `supabase/migrations/003_answers_and_bio.sql`

### Step 3: Verify Database State
Confirm in Supabase SQL Editor:
- `btree_gist` extension is enabled
- `no_double_booking` exclusion constraint exists on `bookings`
- RLS is enabled on: profiles, event_types, availability_rules, bookings, booking_answers
- Broken policies from migration 001 are dropped
- Policies use correct column names (`host_id`, not `user_id` / `host_user_id`)

### Step 4: Run Live Booking-Spine Verification Checklist

**Public Booking Page:**
- [ ] Public booking page loads for a valid host slug
- [ ] Host profile (name, avatar, timezone) renders from Supabase
- [ ] Event types render from Supabase
- [ ] Available time slots render from Supabase availability rules
- [ ] Booked slots show as taken

**Booking Creation — Happy Path:**
- [ ] Guest can fill name, email, notes, select slot
- [ ] Submit succeeds → booking row in Supabase
- [ ] Confirmation page shows booking details

**Booking Creation — Validation (each should show clear error):**
- [ ] Empty name rejected
- [ ] Invalid email rejected
- [ ] Non-existent host_id rejected
- [ ] Inactive event type rejected
- [ ] Slot outside availability rejected
- [ ] Past slot rejected
- [ ] Overlapping booking rejected (create two overlapping bookings)

**Double-Booking Concurrency Test:**
- [ ] Send 5+ parallel requests for the exact same slot
- [ ] Exactly 1 booking is confirmed; others get SLOT_TAKEN
- [ ] Exclusion constraint blocks race condition at DB level

**Dashboard:**
- [ ] Host dashboard shows their own bookings
- [ ] Host A cannot see Host B's bookings

**Security — Anonymous Users:**
- [ ] Anonymous user CANNOT read raw bookings via API
- [ ] Anonymous user CANNOT insert bookings (no RLS INSERT policy)
- [ ] Anonymous user CANNOT read booking_answers
- [ ] Service role key is NEVER exposed to browser (check bundle)

**Frontend Privacy:**
- [ ] Frontend does NOT pre-load private booking records with guest data
- [ ] Slot availability check returns only time ranges, not guest PII

### Step 5: Report Evidence

After completing the above, report:
- Vercel deployment URL
- `git log --oneline -1`
- Migration numbers applied
- RLS policy summary from live DB (`SELECT * FROM pg_policies WHERE schemaname = 'public'`)
- Exclusion constraint confirmation (`SELECT * FROM pg_constraint WHERE conname = 'no_double_booking'`)
- Live booking test: success/error results for each validation case
- Concurrent test: number of confirmed vs rejected requests
- Dashboard test: own-booking visible, other-booking not visible
- Security test: anonymous access results
- Any failed assertions
- Any leftover test data to clean up

## Blocked Until Gate Passes

- Phase 2A: Email confirmations
- Phase 2C: Google Calendar integration
- Phase 3: Stripe payments
- Any new feature work
