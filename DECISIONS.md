# Decisions

## Positioning: NOT "Calendly Killer"

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Position Meetly as "Turn your booking link into a page that sells you first" — a premium booking page for consultants, creators, and service providers.

**Reason:**
"Calendly Killer" and "better than Calendly" are trust-killers. They invite scrutiny and comparison. Meetly's actual advantage is conversion-focused booking pages, not replicating Calendly's scheduling features.

**Alternatives considered:**
- "Scheduling that feels effortless" (original — too generic)
- "Better than Calendly" (rejected — positioning trap)

---

## Remove All Fake Social Proof

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Remove all fake testimonials, celebrity names, fake ratings, and unsupported claims. If testimonials are shown, they must be clearly labeled as demo/placeholder or the section must be empty.

**Reason:**
Fake celebrity testimonials (Elon Musk, Sam Altman) destroy credibility instantly. Users who recognize the names will never trust the product.

---

## Trust Bar: Only Claim What Exists

**Date:** 2026-05-31
**Status:** Active

**Decision:**
Trust bar on booking page only shows: "Instant confirmation" and "Timezone aware" — both actually implemented. Everything else (encrypted, reschedule, email) marked as "Coming Soon" until implemented.

---

## Until Supabase Works: Clearly Label "Early Access"

**Date:** 2026-05-31
**Status:** Active

**Decision:**
All pre-production flows use "Early Access" / "Beta" language. Pricing features disabled. No payment claims.

**Reason:**
The app currently runs on localStorage with fake auth. Advertising payments, calendar sync, or email automation as active features would be dishonest.

---

## Durable Memory Over Chat History

**Date:** 2026-05-31
**Status:** Active

**Decision:**
All important project state is written to repo files (PROJECT_MEMORY.md, CURRENT_STATE.md, WORKLOG.md, DECISIONS.md, NEXT_ACTIONS.md). Chat history is never relied upon as the source of truth.

**Reason:**
Sessions get compacted. Chat history disappears. The repo is the only durable memory.
