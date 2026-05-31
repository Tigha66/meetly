# Current State

## Last Updated
2026-05-31

## Verified Working
- Landing page renders at /
- Booking page renders at /book/abdelhak/intro-call (localStorage-backed)
- Dashboard renders at /dashboard (unprotected)
- Login page renders at /login (fake auth, redirects to dashboard)
- Event types CRUD in dashboard (localStorage)
- Availability rules management (localStorage)
- Basic booking creation (localStorage, no server validation)
- PWA manifest and service worker
- Vercel auto-deploy from main branch

## Demo / Mock / Local Only
- **Authentication:** Login is fake — any valid-looking email/password redirects to /dashboard
- **Data persistence:** All data in localStorage (profiles, event types, availability, bookings)
- **Dashboard access:** /dashboard/* routes are NOT protected by any auth middleware
- **Booking creation:** No server-side validation, no double-booking prevention at DB level
- **Google Calendar:** UI toggle only, no actual OAuth or API integration
- **Email confirmations:** Claimed in UI ("A confirmation has been sent") but no email integration exists
- **Testimonials:** Commented out from defaults (was fake celebrity names); empty array now

## Broken / Risky / Missing
- **Dashboard booking link:** Shows hardcoded `meetly.app` domain instead of actual deployment URL — partially fixed to use NEXT_PUBLIC_APP_URL but `host.slug` variable not in scope (needs fix)
- **No RLS policies applied** to any Supabase tables
- **No middleware** for route protection
- **No server-side booking validation** — double-booking possible

## Trust Issues Fixed (Phase 0 — in progress)
- ✅ Removed fake testimonials (Elon Musk, Sam Altman)
- ✅ Removed fake 5-star ratings from booking page
- ✅ Updated landing page copy: new headline, beta badge, honest features
- ✅ Removed "Google Calendar Sync" from active features → moved to "Coming Soon"
- ✅ Removed "Encrypted & private" from trust bar → labeled "Soon"
- ✅ Removed "Free reschedule" from trust bar → labeled "Soon"
- ✅ Changed "Get started" CTA → "Create your booking page"
- ✅ Added Privacy, Terms, Contact pages with footer links
- ✅ Disabled fake Google OAuth button → labeled "coming soon"
- ✅ Added .env.example
- ⚠️ Dashboard booking link still references hardcoded domain (needs fix)

## Deployment
- Live URL: https://meetly-6vwn.vercel.app
- Last deploy: auto from main branch
- Commit: latest on main

## Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- NEXT_PUBLIC_APP_URL
- RESEND_API_KEY or SENDGRID_API_KEY (not yet configured)
- EMAIL_FROM (not yet configured)

## Current Priority
Complete Phase 0 Trust Clean-up → commit → push → deploy → then begin Phase 1A (Supabase auth foundation)
