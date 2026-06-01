# Current State

## Last Updated
2026-05-31 (Phase 1E implemented and deployed, pending live Supabase verification)

## Status: Phase 1E — CODE COMPLETE, LIVE VERIFICATION BLOCKED

The booking spine is fully coded and deployed but **not production-verified**.
Supabase env vars are NOT set in Vercel.
SQL migrations 001, 002, 003 have NOT been applied to a live database.
No live verification has been performed.

## Verified Working (Code Only)
- Build passes: 20 routes, 0 TypeScript errors
- All API routes coded and deployed

## ⏳ Blocked: Live Production Verification
**Cannot verify anything in production until:**
1. Supabase env vars are set in Vercel (3 vars)
2. SQL migrations 001 + 002 + 003 are applied to live Supabase
3. Live booking-spine verification is completed

**To unblock:** Follow SUPABASE_SETUP_CHECKLIST.md

## Security Fix Applied (This Session)
- Replaced `/api/bookings` GET endpoint: now uses admin client (server-side only) instead of cookie-based client
- Endpoint returns only `start_time` / `end_time` — no guest names, emails, or notes exposed
- Slots are scoped by `host_id` in the query itself (RLS bypass is intentional; server-side filtering)
- Removed `booking_answers` RLS references from migration 002 until table exists (added in migration 003)

## Deployment
- Live URL: https://meetly-6vwn.vercel.app
- Last commit: b85fdcf
- Status: Deployed, awaiting Supabase config + live verification

## Environment Variables Required (NOT YET SET)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (must be server-only, never NEXT_PUBLIC_)
- NEXT_PUBLIC_APP_URL

## Current Priority
1. Configure Supabase env vars in Vercel
2. Apply SQL migrations 001, 002, 003 to live Supabase
3. Run live booking-spine verification checklist
4. Run concurrent same-slot test (prove exclusion constraint works)
5. Only after all tests pass: Phase 2A (email confirmations)

## Do NOT Start
- Phase 2A (email confirmations)
- Google Calendar integration
- Stripe
- Any new feature work

until the live Supabase verification gate is fully passed.
