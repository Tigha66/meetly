# Next Actions

## Highest Priority

1. **Configure Supabase in Vercel** — Until this is done, auth, dashboard, and booking page cannot be verified in production.
   - Follow SUPABASE_SETUP_CHECKLIST.md
   - Add 3 env vars to Vercel
   - Apply SQL migrations in Supabase
   - Test signup → dashboard flow
   - Test /book/[slug]/[event] shows real host data
   - **Acceptance:** Can sign up, log in, see own profile in dashboard, see own event types/bookings, public booking page shows real host

2. **Phase 1E: Real booking creation** — Guest bookings should persist to Supabase with double-booking prevention
   - Why: Currently bookings are localStorage only, no server validation, submit shows "not enabled yet"
   - Acceptance: Guest can fill form → booking saved to Supabase → confirmation shown

3. **Booking page host data migration verification** — Already done in Phase 1C code; needs Supabase config to verify

## Blocked

- Supabase credentials not provided — auth + booking page code deployed but untested live
- Email integration: Resend/SendGrid API key not provided
- Google Calendar OAuth: Google Client ID/Secret not provided
- Stripe: API keys not provided
