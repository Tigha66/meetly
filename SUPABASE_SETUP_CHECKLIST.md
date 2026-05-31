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
3. Run it to create all tables (profiles, event_types, availability_rules, bookings, booking_answers)

## Step 4: Apply RLS Policies

1. In Supabase → SQL Editor
2. Open `supabase/migrations/001_rls_policies.sql` from the repo
3. Run it to enable Row Level Security on all tables

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

### ✅ Migrated to Supabase (Phase 1B)
- Authentication (signup/login/logout)
- Profile (read + update)
- Event types (CRUD — scoped to auth.uid())
- Bookings (read + cancel — scoped to auth.uid())
- Availability rules (CRUD — scoped to auth.uid())

### ⏳ Still Local Storage (Future phases)
- Guest booking creation (Phase 1E)
- Integrations page (Phase 2C)
- Booking page host data (Phase 1C)
- Email confirmations (Phase 2A)
- Stripe/payments (Phase 3)
