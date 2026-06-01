# Supabase Setup Checklist for Meetly

## Prerequisites

- [ ] Create a Supabase project at https://supabase.com
- [ ] Note your project URL and API keys

## Step 1: Get Supabase Credentials

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
2. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...` — keep this secret!)

## Step 2: Add Environment Variables to Vercel

Go to your Vercel project → Settings → Environment Variables and add:

| Variable | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role key) | All |
| `NEXT_PUBLIC_APP_URL` | `https://meetly-6vwn.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Preview/Local |

**IMPORTANT:** Never commit `.env.local` or expose the service role key to the browser.

## Step 3: Apply Database Schema

1. Go to Supabase → SQL Editor
2. Open `SUPABASE_SCHEMA.sql` from the repo
3. Run it to create the base tables (profiles, event_types, availability_rules, bookings)

## Step 4: Apply Migrations in Order

Run these in sequence in Supabase SQL Editor:

1. `supabase/migrations/001_rls_policies.sql` — Initial RLS policies (has some broken column names, will be fixed by 002)
2. `supabase/migrations/002_fix_rls_and_constraints.sql` — Fix broken RLS policies + add double-booking exclusion constraint
   - Creates `btree_gist` extension
   - Adds `no_double_booking` exclusion constraint on bookings
3. `supabase/migrations/003_answers_and_bio.sql` — Add `bio` column to profiles + create `booking_answers` table

## Step 5: Configure Auth Provider

1. Go to Supabase → Authentication → Providers
2. Enable **Email** provider
3. (Recommended for development) Disable **Confirm email** so signups work instantly
4. For production, enable Confirm email and configure SMTP

## Step 6: Verify Setup

1. Redeploy on Vercel (or wait for auto-deploy)
2. Visit https://meetly-6vwn.vercel.app/login
3. Sign up with a test email
4. Should redirect to dashboard after signup
5. Dashboard should show your profile from Supabase

## Troubleshooting

- **"Supabase Not Configured" error**: Check that env vars are set in Vercel and redeployed
- **Profile not created**: Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- **RLS errors**: Make sure the RLS migration was run in Supabase SQL editor
- **Login fails "Invalid login credentials"**: In Supabase → Authentication → Users, check if user exists. If confirm email is enabled, user must confirm first.

## What Uses Supabase vs What's Still Local Storage

### ✅ Migrated to Supabase
- Authentication (signup/login/logout) — Phase 1A
- Profile (read + update) — Phase 1B
- Event types (CRUD — scoped to auth.uid()) — Phase 1B
- Bookings read + cancel (scoped to auth.uid()) — Phase 1B
- Availability rules (CRUD — scoped to auth.uid()) — Phase 1B
- Public booking page (host profile, events, availability from Supabase) — Phase 1C
- **Guest booking creation (validated server-side, inserted via admin client) — Phase 1E**
- **Double-booking protection (server overlap check + DB exclusion constraint) — Phase 1E**

### ⏳ Still Local Storage (Future phases)
- Integrations page (Phase 2C)
- Email confirmations (Phase 2A)
- Stripe/payments (Phase 3)

### Booking insert: RLS policy approach
- Bookings INSERT is handled by the server API route using the **admin client** (service role key)
- The admin client bypasses RLS, so no public INSERT policy is needed
- Server-side validation ensures data integrity (host/event validation, overlap check, availability check)
- Database exclusion constraint (`no_double_booking`) is the final safety net against race conditions
