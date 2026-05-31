---
name: meetly-project-memory
description: Persistent project memory discipline for Meetly. Reads and updates repo memory files so work survives compacted or lost chat sessions.
version: 1.0.0
author: Abdelhak / Hermes Agent
license: MIT
metadata:
  hermes:
    tags:
      - memory
      - project-management
      - meetly
      - handoff
      - repo-discipline
---

# Meetly Project Memory Skill

## Purpose

Use this skill whenever working on the Meetly project.
The goal is to prevent lost work and lost context when chat sessions are compacted, truncated, or unavailable.

Chat history is NOT the source of truth. The repository memory files are the source of truth.

## Project Identity

- **Project:** Meetly
- **Repo:** https://github.com/Tigha66/meetly
- **Live app:** https://meetly-6vwn.vercel.app
- **Product:** Premium booking-page SaaS for consultants, coaches, creators, and service providers.

## Required Memory Files

Maintain these files in the project root:

- `PROJECT_MEMORY.md` — Long-term product/tech facts
- `WORKLOG.md` — Chronological work completed
- `DECISIONS.md` — Product and technical decisions
- `CURRENT_STATE.md` — What works, what's broken, what's deployed
- `NEXT_ACTIONS.md` — Prioritized handoff list

If they do not exist, create them.

## Start-of-Session Procedure

Before changing files, run:

```bash
pwd && ls && git status && git branch --show-current
find . -maxdepth 2 \( -iname "PROJECT_MEMORY.md" -o -iname "WORKLOG.md" -o -iname "DECISIONS.md" -o -iname "CURRENT_STATE.md" -o -iname "NEXT_ACTIONS.md" -o -iname "AGENTS.md" -o -iname "CLAUDE.md" \)
```

Then read all available memory files. Summarize the current known state before making changes.

## End-of-Session Procedure

Before ending work, update:
1. `WORKLOG.md` — What was done
2. `CURRENT_STATE.md` — Current truth
3. `NEXT_ACTIONS.md` — What's next
4. `PROJECT_MEMORY.md` — If long-term facts changed
5. `DECISIONS.md` — If any decision was made

Then explicitly report:
- Memory updated: [list files]
- Committed: yes/no, hash
- Deployed: yes/no, URL

## Critical Rules

1. **Never end a session without updating memory files**
2. **Never write assumptions as facts** — use labels: `Verified`, `Assumption`, `Needs confirmation`, `Blocked`, `Deprecated`
3. **Always commit or explicitly state work is uncommitted**
4. **Always record deployment URL and date**
5. **Track these Meetly-specific facts:**
   - Booking data: Supabase or localStorage?
   - Dashboard auth: enforced or open?
   - Double-booking prevention: exists or missing?
   - Google Calendar: real or documented-only?
   - Email confirmations: exist or missing?

## Worklog Entry Format

```markdown
## YYYY-MM-DD — Short task title

### Summary
What was done.

### Files changed
- path/to/file

### Commands run
Result: Passed / failed / partially complete.

### Commit / Deploy
- Commit: hash / not committed
- Deploy: URL / not deployed

### Notes
Important details future agents need to know.
```
