# Current State

## Last Updated
2026-05-31 (Phase 1A complete)

## Verified Working
- Landing page renders at / with new headline
- Booking page renders at /book/abdelhak/intro-call (localStorage-backed)
- Dashboard renders at /dashboard — now requires auth session
- Login page at /login — real Supabase auth (signup/login)
- Logout works via dashboard sidebar button
- /privacy, /terms, /contact pages render
- PWA manifest and service worker
- Vercel auto-deploy from main branch
- 19 routes build clean (0 errors)

## Phase 1A — Auth Foundation (NEW)
- ✅ Supabase browser client (src/lib/supabase/client.ts)
- ✅ Supabase server client + admin client (src/lib/supabase/server.ts)
- ✅ Route protection via proxy.ts (redirects unauthenticated → /login)
- ✅ Profile bootstrap API (src/app/api/profile/bootstrap/route.ts)
- ✅ Logout API (src/app/api/auth/logout/route.ts)
- ✅ Login page rewritten with real Supabase auth
- ✅ Dashboard layout with session check + logout button
- ✅ RLS policy SQL (supabase/migrations/001_rls_policies.sql) — NOT YET APPLIED to live Supabase
- ✅ .env.example updated with all required vars

## Demo / Mock / Local Only
- **Data persistence:** All data STILL in localStorage (profiles, event types, availability, bookings)
- **Booking creation:** localStorage only, no server-side validation
- **Booking page:** Still uses hardcoded "abdelhak" host — reads from localStorage, not Supabase
- **Google Calendar:** UI toggle only, no actual OAuth
- **Email confirmations:** Claimed in UI but no email integration

## Blocked / Needs Action from User
- **Supabase credentials needed** to test auth: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- **RLS migration** written but not applied to live Supabase project yet
- **Email confirmation** in Supabase project settings needs to be configured (enabled/disabled)

## Deployment
- Live URL: https://meetly-6vwn.vercel.app
- Last deploy: commit 8fed172

## Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL (not set in production yet)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (not set in production yet)
- SUPABASE_SERVICE_ROLE_KEY (not set in production yet)
- NEXT_PUBLIC_APP_URL
- RESEND_API_KEY or SENDGRID_API_KEY (not yet configured)

## Current Priority
Phase 1B — Real auth + dashboard ownership: Make dashboard read from Supabase instead of localStorage. Host profile creation after signup. Unique slug generation.
