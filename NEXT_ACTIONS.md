# Next Actions

## Highest Priority

1. **Configure Supabase in Vercel** — Until this is done, nothing can be verified in production.
   - Follow SUPABASE_SETUP_CHECKLIST.md
   - Add 3 env vars to Vercel
   - Apply SQL migrations in Supabase (001_rls_policies.sql + 002_fix_rls_and_constraints.sql)
   - Test: signup → dashboard → create event type → public booking page → make a booking
   - **Acceptance:** Guest can book, booking appears in host's dashboard

2. **Phase 2A: Email confirmations** — Send booking confirmation emails (Resend/SendGrid)

3. **Phase 2C: Google Calendar integration** — Sync bookings to host's Google Calendar

## Blocked

- Supabase credentials not provided — all code deployed but untested live
- Email integration: Resend/SendGrid API key not provided
- Google Calendar OAuth: Google Client ID/Secret not provided
- Stripe: API keys not provided
