# Project Memory — Meetly

## Product

- **Name:** Meetly
- **Purpose:** Premium booking-page SaaS for consultants, creators, coaches, agencies, and service providers. Turns a booking link into a conversion asset.
- **Positioning:** "Turn your booking link into a page that sells you first." NOT a Calendly clone or "Calendly Killer."
- **Core mantra:** "The booking page that sells you first."

## Tech Stack

- Next.js 16.2.6 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL (schema ready, not yet connected to frontend)
- Vercel deployment
- Playwright tests
- date-fns for scheduling logic

## URLs

- **Repo:** https://github.com/Tigha66/meetly
- **Live app:** https://meetly-6vwn.vercel.app
- **Demo booking page:** /book/abdelhak/intro-call

## Hosting

- Platform: Vercel
- Auto-deploy from: main branch
- Build command: `next build`

## Important Accounts

- GitHub: Tigha66
- Vercel: abdelhaks-projects
- Supabase: Project configured but frontend still uses localStorage

## Schema (Supabase)

Core tables defined in `SUPABASE_SCHEMA.sql`:
- profiles
- event_types
- availability_rules
- bookings
- booking_answers

The schema exists as SQL but RLS policies have NOT been applied to a live Supabase project yet.

## Major Features Built

- Landing page (/ ) — redesigned with trust-cleaned copy
- Booking page (/book/[hostSlug]/[eventSlug]) — functional with localStorage
- Dashboard (/dashboard) — overview, event types, bookings, availability, settings, integrations
- Login page (/login) — fake auth (redirects to dashboard)
- PWA support (service worker, manifest)
- Scheduling logic (date-fns based slot generation)

## Major Features NOT Built

- Real Supabase Auth integration (currently fake login)
- Dashboard route protection (no middleware)
- Supabase data layer (everything still localStorage)
- Double-booking prevention (UI only, no server-side)
- Email confirmations (none)
- Google Calendar OAuth (UI only, not functional)
- Stripe/payments
- Cancellation/reschedule flow (basic cancel exists in dashboard)
- Test suite (Playwright file exists but minimal)

## Known Constraints

- Do NOT claim: "Calendly Killer", "better than Calendly", "encrypted", "payments", "automations", "Google Calendar sync" unless implemented
- Do NOT use fake testimonials or celebrity names
- All timestamps must be stored in UTC
- Default host: "Abdelhak" with slug "abdelhak"
