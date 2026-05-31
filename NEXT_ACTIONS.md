# Next Actions

## Highest Priority

1. **Fix dashboard booking link** — `host.slug` not in scope in dashboard component. Need to fetch profile from storage and use its slug, or hardcode the actual deployment URL.
   - Files: `src/app/dashboard/page.tsx`
   - Acceptance: Booking link shows correct deployment URL

2. **Build and verify Phase 0 changes** — Run `npm run build` to confirm no compilation errors from all the patches made today.
   - Files: all modified files
   - Acceptance: Clean build, no TypeScript errors

3. **Commit and push Phase 0** — All trust cleanup changes need to be committed and pushed to main.
   - Acceptance: `git status` clean, changes on GitHub

4. **Deploy to Vercel** — Push should auto-deploy, verify live site reflects all changes.
   - Acceptance: https://meetly-6vwn.vercel.app shows updated landing page, working footer links, no fake content

5. **Phase 1A: Supabase auth foundation** — Add Supabase client utilities, middleware, RLS policies, protect dashboard routes.
   - Why: Currently anyone can access /dashboard without login. This is the #1 production gap.
   - Files: new files in `src/lib/supabase/`, `supabase/migrations/`, `src/middleware.ts`
   - Acceptance: App builds, dashboard redirects unauthenticated users, schema migration exists, RLS enabled, .env.example updated

## Blocked

- **None currently** — User has not provided Supabase project credentials yet (URL, anon key, service role key). Phase 1A can scaffold the files but cannot fully test without these.
- **Email integration:** Resend/SendGrid API key not provided yet.
- **Google Calendar OAuth:** Google Client ID/Secret not provided yet.
- **Stripe:** API keys not provided yet.

## Uncommitted Work in Progress

Modified but NOT committed:
- `src/app/page.tsx` — Full rewrite (Phase 0 trust cleanup)
- `src/lib/storage.ts` — Removed fake testimonials
- `src/app/book/[hostSlug]/[eventSlug]/page.tsx` — Trust bar fix, removed Star import, testimonials section update
- `src/app/login/page.tsx` — Disabled Google OAuth, removed handleGoogleLogin
- `src/app/dashboard/page.tsx` — Booking link URL fix (partial)
- `src/app/privacy/page.tsx` — New
- `src/app/terms/page.tsx` — New
- `src/app/contact/page.tsx` — New
- `.env.example` — New
- `PROJECT_MEMORY.md` — New
- `CURRENT_STATE.md` — New

All need to be committed together as: `chore: trust cleanup before production migration`
