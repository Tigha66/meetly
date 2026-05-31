# Next Actions

## Highest Priority

1. **Add Supabase credentials to Vercel + test auth**
   - Why: Phase 1A code is deployed but can't work without real Supabase credentials
   - Needed from user: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
   - Steps: Add to Vercel environment variables → test signup/login flow

2. **Apply RLS migration to Supabase**
   - Why: RLS policies exist as SQL but haven't been run against the live database
   - Run: `supabase db push` or manually run `supabase/migrations/001_rls_policies.sql` in Supabase SQL editor

3. **Phase 1B: Dashboard ownership from Supabase**
   - Why: Dashboard currently reads from localStorage. After login, it should show the logged-in user's data from Supabase.
   - Files: `src/app/dashboard/page.tsx`, `src/app/dashboard/layout.tsx`
   - Acceptance: Dashboard shows logged-in user's profile from Supabase, not hardcoded "host_1"

4. **Phase 1C: Event types migration to Supabase**
   - Why: Event type CRUD still uses localStorage
   - Files: `src/app/dashboard/event-types/page.tsx`
   - Acceptance: Host creates event type → persists in Supabase → public page reads from Supabase

## Blocked

- Supabase credentials not provided yet — auth code deployed but untested
- Email integration: Resend/SendGrid API key not provided
- Google Calendar OAuth: Google Client ID/Secret not provided
- Stripe: API keys not provided
