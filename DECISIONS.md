# Decisions

## Positioning: NOT "Calendly Killer"

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Position Meetly as "Turn your booking link into a page that sells you first" — a premium booking page for consultants, creators, and service providers.

**Reason:**
"Calendly Killer" and "better than Calendly" are trust-killers. They invite scrutiny and comparison. Meetly's actual advantage is conversion-focused booking pages, not replicating Calendly's scheduling features.

---

## Remove All Fake Social Proof

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Remove all fake testimonials, celebrity names, fake ratings, and unsupported claims.

**Reason:**
Fake celebrity testimonials (Elon Musk, Sam Altman) destroy credibility instantly.

---

## Trust Bar: Only Claim What Exists

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Trust bar only shows "Instant confirmation" and "Timezone aware" — both actually implemented. Everything else marked "Coming Soon".

---

## Until Supabase Works: Clearly Label "Early Access"

**Date:** 2026-05-31
**Status:** Active

**Decision:**
All pre-production flows use "Early Access" / "Beta" language. No payment claims.

---

## Durable Memory Over Chat History

**Date:** 2026-05-31
**Status:** Active

**Decision:**
All important project state is written to repo files. Chat history is never relied upon.

---

## Auth Architecture: Supabase Auth Only (No NextAuth)

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Use Supabase Auth directly. Do NOT add NextAuth as a separate layer.

**Reason:**
The project already has `@supabase/supabase-js` and a Supabase schema. Adding NextAuth would introduce a second auth system with no benefit. Supabase Auth provides email/password, session management, and cookie-based auth out of the box.

**Alternatives considered:**
- NextAuth + Supabase Postgres driver (rejected — unnecessary complexity)
- Custom JWT auth (rejected — Supabase Auth already handles this)

---

## Route Protection: proxy.ts (Next.js 16 convention)

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Use `src/proxy.ts` with named `proxy` export instead of deprecated `middleware.ts`.

**Reason:**
Next.js 16 renamed middleware to proxy. The old `middleware.ts` convention is deprecated and shows build warnings.

---

## Profile Bootstrap: Server API Route with Admin Client

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Profile creation on signup happens via `/api/profile/bootstrap` POST route using the Supabase admin (service role) client.

**Reason:**
After signup, the user's session may not yet have an active JWT (if email confirmation is required). The admin client bypasses RLS to create the initial profile row. The route validates the userId matches the authenticated user.

---

## Slug Generation: Email Prefix + Uniqueness Check

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Generate slugs from the user's email prefix (before @), sanitized to lowercase alphanumeric with hyphens. Append incrementing counter if slug already exists.

**Reason:**
Simple, deterministic, and doesn't require user input during signup. The uniqueness check prevents collisions.
