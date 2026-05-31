# Current State

## Last Updated
2026-05-31 (Phase 1C complete — code ready, awaiting Supabase config)

## Verified Working (Code)
- Build passes: 20 routes, 0 TypeScript errors
- Login page rewritten with real Supabase auth
- Dashboard pages all rewritten to read from Supabase scoped to auth.uid()
- Route protection via proxy.ts
- Profile bootstrap API on signup
- Logout API + dashboard logout button
- Clear env var validation with setup instructions displayed in dashboard
- Public booking page rewritten to fetch host profile, event types, and availability from Supabase APIs
- New API routes: /api/host/[slug], /api/host/[slug]/events, /api/host/[slug]/availability, /api/bookings
- Booking page handles loading, error (host not found, no events, Supabase not configured) states
- Booking submission clearly marked as "not enabled yet" with amber notice

## ⏳ Blocked: Live Production Verification
**Supabase env vars NOT set in Vercel yet** — the following code is deployed and will work once configured:
- Authentication (signup/login/logout)
- Dashboard data ownership (scoped to auth.uid())
- Profile bootstrap on signup
- Event types CRUD from Supabase
- Bookings read from Supabase
- Availability CRUD from Supabase
- Public booking page (host lookup by slug, event types, availability)
- API routes for public booking data

**To unblock:** Follow SUPABASE_SETUP_CHECKLIST.md

## Still Demo / Local Only
- **Guest booking creation:** localStorage (Phase 1E) — submit button shows "not enabled yet"
- **Integrations page:** localStorage, fake toggle (Phase 2C)
- **Email confirmations:** Claimed but not implemented (Phase 2A)
- **Google Calendar OAuth:** UI only (Phase 2C)
- **Stripe payments:** Not started (Phase 3)
- **Scheduling defaults:** localStorage (min notice, buffers, max daily bookings)
- **Testimonials:** localStorage (removed from booking page entirely)

## Deployment
- Live URL: https://meetly-6vwn.vercel.app
- Last deploy: commit (Phase 1C)
- Status: Deployed but auth/booking blocked by missing Supabase env vars

## Environment Variables Required (NOT YET SET)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

## Current Priority
1. Configure Supabase in Vercel (follow SUPABASE_SETUP_CHECKLIST.md)
2. Test signup/login flow
3. Apply RLS migration to Supabase
4. Verify dashboard shows correct user data
5. Verify public booking page shows real host data
6. Phase 1E: Real booking creation
