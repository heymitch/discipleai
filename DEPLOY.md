# Deploy Guide — AI Church Leadership Quiz

**Status as of 2026-05-14:** Phases 1–5 complete and tested locally. Phase 6 (deploy) requires a routing decision from you.

## The Situation

Your existing **`discipleai` Vercel project** (id `prj_4iY6wEMzLvMr7MuCyOzHrkPAQut4`, domain `discipleai.vercel.app`) is currently connected to a **git repository** and auto-deploys from branch `claude/festive-aryabhata-32c335`. The latest deploy includes a "password-gated marketing dashboard at /dashboard" — features that live in that git source, not in this `disciple-ai-tutorial-sprint` directory.

If I run a one-shot Vercel deploy from this directory, I'd overwrite your production site with code that doesn't have `/dashboard` (or any other features that have shipped via git since you spun up that tutorial folder).

**This is a routing decision only you can make. Three options:**

## Option A — Merge quiz into existing git repo *(recommended)*

Push the quiz files into the same git repo that powers `discipleai.vercel.app`. Vercel auto-deploys on push.

**Files to copy from this directory into that repo:**
- `ai-quiz/` (entire directory)
- `api/submit-quiz.js`
- `api/save-contact.js`
- `api/log-event.js`
- `package.json` — merge into existing if it exists (we use `"type": "module"`, `"node": ">=20"`, no runtime deps)
- `vercel.json` — merge the `rewrites` and `headers` entries into existing
- `supabase/migrations/001_quiz_v1_schema.sql` (for reference; already applied)
- `docs/superpowers/specs/` and `docs/superpowers/plans/` and `PRD.md` (optional but recommended for future agents)

**Steps:**
1. Clone the repo connected to `discipleai` Vercel project (path/URL?)
2. Copy the files above into the appropriate locations
3. Add env vars in Vercel dashboard (see "Env vars" below)
4. Commit + push to `claude/festive-aryabhata-32c335` (or whichever branch deploys)
5. Vercel auto-deploys
6. Smoke-test at `https://discipleai.vercel.app/ai-quiz`

**To unblock me on this option:** tell me the repo URL or path and I'll do the merge for you.

## Option B — Deploy this directory as a separate Vercel project

Create a new Vercel project (e.g. `discipleai-quiz`) that deploys this directory and attaches a subdomain like `quiz.discipleai.com` or `ai-quiz.discipleai.com`.

**Pros:** isolation — quiz changes can't break the main site.
**Cons:** two projects to maintain, different domain than `discipleai.vercel.app/ai-quiz`.

**To unblock me on this option:** confirm and tell me the desired subdomain.

## Option C — Use this directory as the new source of truth

Replace the git-backed deploy with a deploy from this directory. **This wipes your existing `/dashboard` and any other features that live only in the connected git repo unless they're copied back.**

I'd only recommend this if the existing deployed features can be re-derived from the design tarball / are no longer needed. Probably not the right call.

---

## Env Vars (apply in Vercel dashboard for whichever project hosts the quiz)

| Name | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://dquuimhmbofdhdsbdbly.supabase.co` | speakeasy-agent project |
| `SUPABASE_ANON_KEY` | `sb_publishable_iAG5hElT7llq6M5BJnBvWw_axNvv6kF` | RLS-locked: anon can INSERT only |
| `SCHEDULING_URL` | `https://calendar.notion.so/meet/heymitch/g31gy4pjd` | Notion Calendar interview link |
| `KIT_API_KEY` | *(leave blank for now)* | Endpoints no-op gracefully if unset |

Set all three across **Production + Preview + Development** scopes.

## Local Dev (works today)

```bash
cd /Users/heymitch/disciple-ai-tutorial-sprint
npm run dev   # serves /ai-quiz/ at http://localhost:8080/ai-quiz/
```

This runs `python3 -m http.server 8080`. The static UI works fully. Network calls to `/api/*` will 404 since `python -m http.server` doesn't run serverless functions — for that, use `vercel dev` if you install the CLI (`npm i -g vercel && vercel link && vercel dev`).

## Smoke Test After Deploy

1. Visit `<deploy-url>/ai-quiz`
2. Take the quiz with a consistent Pioneer pattern + drift answer
3. Verify result renders archetype "Pioneer", grade "B", drift caveat visible
4. Submit email with interview opt-in checked
5. Verify Calendly link appears in success state
6. Check Supabase: `quiz_submissions`, `quiz_contacts`, `quiz_events` should each have one row

## Pre-Existing Security Note (Separate Issue)

The `speakeasy-agent` Supabase project has **64 pre-existing tables with RLS disabled** — fully exposed to the anon key. This is unrelated to the quiz (our new `quiz_*` tables are properly locked down) but worth triaging in a separate session. See the migration we applied for the "secure by default" pattern.
