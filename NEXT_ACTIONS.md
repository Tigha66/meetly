# Next Actions

## Highest Priority

1. **Configure Supabase in Vercel** — Until this is done, auth and dashboard data ownership cannot be verified in production.
   - Follow SUPABASE_STEP_CHECKLIST.md
   - Add 3 env vars to Vercel
   - Apply SQL migrations in Supabase
   - Test signup → dashboard flow
   - **Acceptance:** Can sign up, log in, see own profile in dashboard, see own event types/bookings

2. **Phase 1C: Migrate booking page host data to Supabase** — /book/[hostSlug]/[eventSlug] should fetch profile + event types from Supabase, not localStorage.
   - Why: Currently the booking page shows hardcoded "Abdelhak" data regardless of who's logged in
   - Acceptance: Visiting /book/john/intro-call shows John's real Supabase profile and event types

3. **Phase 1E: Real booking creation** — Guest bookings should persist to Supabase with double-booking prevention
   - Why: Currently bookings localStorage only, no server validation

## Blocked

- Supabase credentials not provided — auth code deployed but untested live
- Email integration: Resend/SendGrid API key not provided
- Google Calendar OAuth: Google Client ID/Secret not provided
- Stripe: API keys not provided
