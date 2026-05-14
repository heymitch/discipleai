# AI Church Leadership Quiz — Design Spec

**Date:** 2026-05-14
**Status:** Draft, awaiting user review
**Owner:** Mitch
**Related:** [PRD.md](../../../PRD.md)

## 1. Purpose

A free, shareable, ungameable typing quiz that places a respondent on the Christian-AI-discourse map and gives them a letter-grade assessment of how coherent their position actually is. The result page invites them into a 15–30 minute interview (coffee on Mitch for Arizona locals) so their thinking can be featured on the Disciple AI Substack.

**Funnel intent (in priority order):**
1. Generate qualified interview leads (pastors, ministry leaders, seminary thinkers, Christian writers who want to publish on AI + church)
2. Generate aggregate editorial data for newsletter content
3. Build a notify list for the v2 group/congregation version of this tool (a larger lead magnet aimed at churches who want to assess their small groups or whole congregations)
4. Build a Christian-worldview AI-readiness dataset that doesn't exist anywhere else
5. Secondary email capture for the Kit-managed list (a layer below the Substack newsletter, used for personal outreach and per-archetype email courses)

## 2. User Flow

```
Landing → Intro (1 screen) → Q1 → Q2 → ... → Q11 → Result page (single page)
                                                       ↓
                                        Email capture (interview opt-in primary,
                                                        newsletter secondary)
                                                       ↓
                                        Share buttons + archetype deep-dive link
```

Single-page result is the design priority. The full result (archetype, grade, dimension breakdown, narrative) is visible *before* email capture. Email capture is a soft conversion below the fold, framed around interview willingness, not gating.

## 3. The Quiz

### Structure

- **11 questions** total
- **Questions 1–10:** 2 questions per scoring dimension, each with 5 archetype-aligned answer options
- **Question 11:** dedicated worldview-drift-gate question
- **Answer order randomization** within each question (so the A–E archetype order doesn't pattern-match across questions and create gaming opportunity)
- All answers positively framed within their archetype — no detectable "right" answers

### The Five Archetypes

| Archetype | Camp | One-line identity |
|---|---|---|
| **Watchman** | Eschatological | Sees AI as spiritually significant and stands guard |
| **Steward** | Cautious skeptic | Treats AI as a powerful tool requiring written wisdom |
| **Builder** | Pragmatic adopter | Uses AI to multiply ministry capacity |
| **Pioneer** | Kingdom optimist (anti-transhumanist) | Sees AI as gift for accelerating mission while holding imago Dei firm |
| **Preservationist** | Principled non-engagement | Builds a community formed by embodied, pre-digital practice |

### The Five Scoring Dimensions

1. **Theological Clarity** (Q1, Q2) — Do you know what you believe about AI and why?
2. **Pastoral Integrity** (Q3, Q4) — Do you protect what shouldn't be outsourced?
3. **Operational Alignment** (Q5, Q6) — Does your church's practice match your stated theology?
4. **Cultural Discernment** (Q7, Q8) — Do you understand the broader AI moment?
5. **Discipleship Formation** (Q9, Q10) — Are your people equipped to think and live wisely?

### The 11 Questions

(See "Locked Question Set" in Appendix A. Full text approved by user 2026-05-14.)

## 4. Scoring Engine

### Inputs
- 11 answer selections, each tagged with an archetype affinity
- Q11 additionally carries a worldview-drift signal (one option = drift, four options = imago-Dei-intact)

### Step 1 — Primary Archetype Assignment

Plurality across Q1–Q10 (Q11 does not vote for archetype). Tie-breaking order:
1. Match against Q1 (foundation question) — whichever tied archetype matches Q1 wins
2. If Q1 didn't tie-break, use highest dimension breadth — whichever tied archetype appeared across more dimensions wins
3. If still tied, use Q11's archetype tilt: option C → Pioneer wins; option E → Preservationist/Steward wins; otherwise fall back to alphabetical order on internal archetype keys to keep the outcome deterministic

### Step 2 — Coherence Score

`coherence = (count of primary-archetype answers across Q1–Q10) / 10`

### Step 3 — Dimension Breadth

`dimension_breadth = (count of dimensions where ≥1 answer matched primary archetype) / 5`

Five dimensions. If respondent's primary archetype shows up in all 5 dimensions, breadth = 1.0. If their primary archetype clustered in only 2 dimensions, breadth = 0.4.

### Step 4 — Modifiers

- **Monoculture penalty:** if coherence ≥ 0.9 → grade caps at B (signals fundamentalism / unexamined position regardless of which archetype)
- **Worthy-successor drift:** Q11 = drift option
  - If primary archetype = Pioneer → grade caps at B, result includes explicit "worthy-successor drift" caveat with Crouch/Lewis/Berry reading recommendations
  - If primary archetype ≠ Pioneer → result includes softer "watch for acceleration drift" caveat, no grade cap

### Step 5 — Grade Lookup (v1, tunable)

| Coherence | Dimension Breadth | Monoculture? | Drift? | Grade |
|---|---|---|---|---|
| 0.70–0.89 | ≥ 0.8 | No | No | **A** |
| 0.70–0.89 | ≥ 0.8 | No | Yes (Pioneer) | **B** (drift cap) |
| ≥ 0.9 | any | Yes | No | **B** (monoculture cap) |
| 0.50–0.69 | ≥ 0.6 | No | No | **B** |
| 0.50–0.69 | any | any | Yes | **C** |
| 0.30–0.49 | any | any | any | **D** |
| < 0.30 | any | any | any | **F** |

Tunable post-launch based on early data. First 100 responses will be manually reviewed against the algorithm.

### Step 6 — Dimension Sub-Scores

For each of the 5 dimensions, report a per-dimension letter grade:
- Both questions match the primary archetype → **A**
- One question matches the primary archetype → **B**
- Neither matches the primary archetype, but both questions in this dimension share a consistent *secondary* archetype → **C**
- The two questions in this dimension pick two different non-primary archetypes → **D**

(Dimension sub-scores are A–D; the overall quiz grade remains A–F. Whole-quiz failure conditions don't apply at the dimension level.)

This drives the "see your breakdown" section of the result page.

## 5. Result Page

### Anatomy (single page, scrollable, share-friendly)

1. **Hero band**
   - Archetype headline: *"You are a **Pioneer.**"*
   - Grade tag: large **A** / **B** / **C** / **D** / **F** (v1 uses whole letters; plus/minus modifiers deferred to v2)
   - One-sentence positioning line ("Kingdom acceleration with imago Dei held firm.")
2. **Personalized narrative paragraph** — 80–120 words, archetype + grade-specific
3. **Dimension report card** — 5 sub-grades with one-line commentary each
4. **Drift caveat panel** (only renders if Q11 drift triggered) — softer or harder depending on primary archetype
5. **What's next for you** — 3 archetype-specific recommendations (one practice, one reading, one prompt-or-skill OR one suggested-absence)
6. **Email capture block** — interview invitation primary, newsletter secondary (see §6)
7. **Share row** — pre-filled X / LinkedIn / Substack Notes / copy-link, all including archetype and grade ("I'm a Pioneer (A−) on the Disciple AI Church Leadership Quiz")
8. **Footer link to the mega deep-dive post** for the respondent's archetype (when those posts ship; until then, link to the Substack)

### Copy Generation Strategy

25 archetype × grade variants is too much copy to write inline. Instead:

- **Archetype shell** (5 total): a ~300-word canonical description of each archetype's mature form
- **Grade-delta paragraphs** (5 grades × 5 archetypes = 25 short blocks): 40–60 words each describing what this specific grade looks like within this archetype
- Result page assembles: `[grade headline] + [archetype shell intro] + [grade-delta paragraph] + [dimension breakdown] + [drift caveat?] + [what's next]`

This keeps total writing burden to: 5 shells + 25 grade-deltas + 5 drift-caveat variants + 5×3 "what's next" recs (15 recs) + 5 archetype share-copy templates = manageable.

## 6. Email Capture & Interview Funnel

### Copy Direction

Headline: **"Willing to talk about this further?"**

Body: "Disciple AI is publishing a Substack newsletter that surfaces the smartest thinking from pastors and ministry leaders on AI and the church. I'd love to interview you for 15–30 minutes about your position. **If you're in Arizona — coffee's on me.**"

### Privacy & Consent Line (required, prominent)

Immediately under the body copy, before the form fields, in slightly smaller but still readable type:

> **What we'll do with your information:** We use it to reach out to you about this conversation — nothing else. We will never publish, quote, or attribute your quiz responses or anything you share without your explicit, written permission. If you choose to be featured in the newsletter later, that's a separate conversation we'll have with you directly.

This line is non-negotiable and must be visible without scrolling once the email block is reached.

### Fields

- Email (required if opting in)
- Name (required if opting in)
- Role (optional dropdown: pastor / ministry leader / writer / theologian / other)
- "Are you in Arizona?" (optional yes/no)
- Three opt-in checkboxes (none pre-checked):
  - ☐ **Yes, willing to talk further** (15–30 min interview — Mitch's Calendly link delivered on submit)
  - ☐ **Notify me when the group/congregation version is ready** (a deeper version of this tool for small groups, ministry teams, or whole congregations — v2 deliverable)
  - ☐ **Add me to the Kit list** (personal-outreach layer; per-archetype email content; separate from the Substack newsletter)

CTA button: **"Submit"**

If interview opt-in is checked → success state includes Mitch's connected Calendly link for a 15–30 min slot. (Calendly URL TBD — Mitch will provide before launch; the existing Calendly account integration via the loaded MCP is the source of truth.)

### Conversion Hierarchy

- **Primary conversion:** interview opt-in
- **Secondary conversion:** group/congregation version notify-list opt-in
- **Tertiary conversion:** Kit list subscribe
- **Quaternary conversion:** social copy/screenshot share (no email captured; logged as anonymous "shared" event if we can detect the copy-link action)

## 7. Data Model

Store one row per quiz submission. Submissions are recorded on result-page reveal (anonymous), and updated if email is provided later.

```
submission {
  id: uuid
  created_at: timestamp
  session_id: uuid (browser-side cookie, dedupes accidental double-takes)
  responses: jsonb {
    q1: "watchman" | "steward" | "builder" | "pioneer" | "preservationist"
    q2: ...
    ...
    q11: "imago_a" | "imago_b" | "imago_c_pioneer" | "drift" | "imago_e"
  }
  computed: jsonb {
    primary_archetype: string
    coherence: float
    dimension_breadth: float
    monoculture_flag: bool
    drift_flag: bool
    grade: "A" | "B" | "C" | "D" | "F"
    dimension_grades: { theological_clarity: "A", pastoral_integrity: "B", ... }
  }
  email: nullable string
  name: nullable string
  role: nullable string
  is_arizona: nullable bool
  interview_opt_in: nullable bool
  group_version_opt_in: nullable bool   -- notify list for v2 group/congregation tool
  kit_opt_in: nullable bool             -- replaces previous newsletter_opt_in field
  consent_to_outreach: bool             -- true by virtue of submitting with email; logged for audit
  referrer: nullable string
  user_agent_hash: nullable string (for bot detection only)
}
```

A second table `events` logs funnel steps:
```
event {
  id, session_id, event_type ("started" | "completed" | "email_given" | "interview_yes" | "shared_to_X"), created_at
}
```

## 8. Architecture & Tech Stack

### Recommended

- **Frontend:** Vanilla HTML + CSS + minimal JS, served from `/ai-quiz` path on the existing site. Inherits design tokens from [colors_and_type.css](../../../colors_and_type.css). No React unless future complexity warrants.
- **Backend:** Single Vercel serverless function (`POST /api/submit-quiz`) writing to Supabase Postgres.
- **Database:** Supabase Postgres (already in stack per loaded MCP tools).
- **Scheduling:** Calendly via Mitch's connected account (loaded MCP tool). Specific scheduling URL to be supplied by Mitch before launch; the serverless function passes it to the result-page success state for interview opt-ins.
- **Email/CRM:** **Kit** (formerly ConvertKit) for the per-archetype outreach list and any future email-course delivery. Submissions with `kit_opt_in = true` are pushed to Kit via its API; submissions with `interview_opt_in = true` are tagged separately within Kit for personal-outreach workflows. Substack is *not* used by this funnel — it lives at a separate, news-layer above this tool.
- **Analytics:** Lightweight events to Supabase + Vercel Analytics for traffic. Dashboard is a separate sub-project.

### Why this stack

- Static-first matches existing site; no SSR complexity for a 1-page tool
- Supabase gives queryable structured data for editorial work without standing up infra
- One serverless function is the smallest reasonable backend
- Avoids new vendors and matches tools already authorized

## 9. Out of Scope (Separate Sub-Projects)

These are explicitly *not* in this spec. They each warrant their own brainstorm → spec → plan cycle:

- **Group / Congregation version of the quiz (v2 lead magnet)** — a deeper version intended for small groups, ministry teams, or whole congregations to take collectively. This spec captures the notify-list demand signal (`group_version_opt_in`); the build comes later.
- **Analytics dashboard** — separate build; this spec lays the data foundation for it
- **Archetype mega deep-dive posts** — editorial work, not build deliverable
- **Email course / drip sequences** per archetype (delivered via Kit)
- **Per-archetype prompt-and-skill library**
- **Denominational and geographic editorial cross-tabs**
- **Interview-transcript-to-Substack-post pipeline**

## 10. Success Criteria

**Launch criteria (must-have for v1):**
- 11 questions render in order, mobile-responsive, on-brand
- Scoring engine produces archetype + grade for every complete submission
- Result page renders the correct archetype-grade copy variant
- Submission persists to Supabase
- Email capture works; Calendly link delivered to interview opt-ins
- Share buttons produce pre-filled archetype-and-grade share text

**Quality criteria (for trust):**
- Drift gate fires correctly in unit tests for all 5 primary archetypes
- Monoculture penalty fires correctly when coherence ≥ 0.9
- All 25 archetype × grade copy variants exist and pass voice review
- Result page loads under 2 seconds
- Quiz completion rate ≥ 60% (measured first 30 days)

**Editorial criteria:**
- First 100 submissions manually reviewed and graded against algorithm
- First aggregate editorial piece published within 30 days of launch
- At least 3 interview leads converted to published features within 60 days

## 11. Resolved Decisions (2026-05-14 review pass)

| # | Decision | Resolution |
|---|---|---|
| 1 | Email/CRM destination | **Kit** (replaces all earlier Substack-as-newsletter references in this spec). Substack stays the news-layer above this tool but is not the destination for quiz email capture. |
| 2 | Calendly link | Use Mitch's connected Calendly account. Specific URL to be provided before launch. Single calendar for both AZ-coffee and remote-Zoom; the slot type can be selected by the booker in Calendly directly. |
| 3 | Anonymity / data use | Strict outreach-only consent at submit time. **Quiz responses and personal information will never be published, quoted, or attributed without explicit, written permission obtained separately.** Aggregate stats (e.g., "73% of pastors scored D or F on Discipleship Formation") use only the anonymized computed fields, never the raw responses or anything identifying. |
| 4 | Domain / path | `/ai-quiz` on the existing Disciple AI site. |
| 5 | Email capture visibility | Visible immediately on result page. No deeper-breakdown gate. |
| 6 | OG share images | Skipped for v1. Respondents can screenshot. |
| 7 | First-100 manual algorithm review | Mitch does it personally. |
| 8 | Privacy / consent line | Required, prominent, included in §6 above. |
| 9 | Grade format | Whole letters only for v1 (A/B/C/D/F). Plus/minus deferred. |
| 10 | Group/congregation version | **NEW** — added as a v2 lead magnet. This v1 captures the notify-list demand signal via the result-page checkbox; the deeper tool is a separate sub-project. |

## 12. Remaining Open Items

Only one genuinely-open item before implementation planning:

1. **Calendly URL for the success state** — Mitch will provide. Until provided, implementation should support a single environment variable (`CALENDLY_URL`) so the URL can be supplied at deploy time without a code change.

Everything else is locked.

## Appendix A — Locked Question Set

(All 11 questions with 5 answer options each, approved by user 2026-05-14. Full text mirrored from brainstorming session.)

### Dimension 1 — Theological Clarity

**Q1.** *When someone in your church asks you "Is AI good or bad for the Christian life?" what's closest to your honest answer?*
- A) "AI is shaping up to be one of the most spiritually significant phenomena of our age, and we need to be ready for what it reveals about the times." — Watchman
- B) "AI is a powerful technology that magnifies who we already are — for good or for ill — so wisdom and formation matter more than ever." — Steward
- C) "AI is a tool. Like every tool, it can be used well or poorly, and the church should be intentional about which uses serve the mission." — Builder
- D) "AI is a remarkable gift that could accelerate the church's calling — translation, accessibility, equipping — if we steward it with theological clarity." — Pioneer
- E) "AI is something happening out there in the world. Our calling is the same as it always has been — to be a faithful, embodied people." — Preservationist

**Q2.** *What's the most important theological truth for the church to hold as AI advances?*
- A) That we are in the last days, and our task is to discern the signs of the times faithfully. — Watchman
- B) That humans bear the image of God in a way no technology will ever replicate, and our practices must reflect that. — Steward
- C) That every good gift comes from God and can be received with thanksgiving when used rightly. — Builder
- D) That God has called humanity to creative stewardship of his world, and what we build can serve the kingdom. — Pioneer
- E) That the gospel does not need new tools to do its work — the Spirit, the Word, and the sacraments are sufficient. — Preservationist

### Dimension 2 — Pastoral Integrity

**Q3.** *Your associate pastor mentions she used AI to help draft Sunday's sermon. What's your first response?*
- A) "Let's talk about what AI in sermon prep is doing to your sense of God's voice." — Watchman
- B) "Let's make sure we have a policy that protects the integrity of preaching." — Steward
- C) "How did you use it — outline, research, polish? And was the congregation told?" — Builder
- D) "How did it serve the text? I want to learn from how you used it." — Pioneer
- E) "What made sermon prep feel so heavy this week? Let me carry some of it." — Preservationist

**Q4.** *A member tells you they've been talking to an AI chatbot every night for spiritual support — and they find it more helpful than your sermons. What do you do?*
- A) Take it as a signal of where the spiritual disorientation of our age is reaching our pews. Preach into it on Sunday. — Watchman
- B) Sit with them. Listen first. Then teach the difference between counsel and communion. — Steward
- C) Ask what's working about it. Maybe the church needs to be more available for late-night spiritual conversation. — Builder
- D) Get curious about what helped — then point them to spiritual practices and relationships only humans can offer. — Pioneer
- E) Invite them over for dinner. Some things only happen at a table. — Preservationist

### Dimension 3 — Operational Alignment

**Q5.** *Which best describes your church's current actual practice with AI (regardless of stated position)?*
- A) We're cautious — our staff knows we name AI as part of the larger cultural and spiritual landscape we're navigating. — Watchman
- B) We have written guidelines that say what we will and won't use AI for, and our staff trains to them. — Steward
- C) We use it across admin, comms, and accessibility — with clear human ownership on every output. — Builder
- D) We use it, we share what we learn, and we help other churches think through what's possible. — Pioneer
- E) We don't use it — embodied, pre-digital practice is part of what our community is for. — Preservationist

**Q6.** *If a volunteer used AI to write a children's ministry curriculum without telling anyone, how would your church find out?*
- A) Discernment from leadership — we tend to notice when something feels off spiritually. — Watchman
- B) Our policy requires disclosure, so we'd find out through reporting. — Steward
- C) We'd see it in our review workflow — curriculum gets vetted before it's used. — Builder
- D) We've made AI use normal enough that the volunteer would have just told us. — Pioneer
- E) Our culture doesn't invite that kind of solo workflow — curriculum gets shaped in community here. — Preservationist

### Dimension 4 — Cultural Discernment

**Q7.** *What does the AI conversation look like in 10 years, and what does your church need to be ready for?*
- A) Significant cultural and spiritual upheaval — possibly the kind we're warned about. Our people need to be anchored in truth that doesn't move. — Watchman
- B) Powerful enough to require ongoing ethical work — our people need formation that can hold complexity. — Steward
- C) Embedded in nearly everything — our people need fluency without losing their souls. — Builder
- D) A meaningful new layer of human capability — our people need imagination for what's now possible in mission. — Pioneer
- E) Less central than the conversation assumes — our people need to be formed in the pace and presence God designed us for. — Preservationist

**Q8.** *How do you read the broader (non-Christian) AI conversation?*
- A) The hype is louder than the substance, and the moral compromises being made are alarming — Christians should be especially careful what they take in. — Watchman
- B) There's genuine signal beneath the noise, and Christians should learn enough to engage thoughtfully. — Steward
- C) It's where the future is being shaped — we should be there, even when we don't agree with all of it. — Builder
- D) The conversation is missing a theological frame, and Christians who show up well-formed can offer something the world needs. — Pioneer
- E) The conversation is mostly downstream of the same restlessness we've seen for centuries — we don't need to be inside it to be wise about it. — Preservationist

### Dimension 5 — Discipleship Formation

**Q9.** *How are the teenagers in your church currently being formed in their relationship with AI and screens?*
- A) We name the spiritual dimension of what's happening to attention and identity, and we equip parents to push back. — Watchman
- B) We teach a framework for wisdom and discernment — they're going to use these tools, so they need to think Christianly about them. — Steward
- C) We build practical skills — how to use AI well, how to disclose, how to keep their own thinking sharp. — Builder
- D) We're showing them what AI can do for kingdom work — translation, missions, creativity — so they grow up seeing tech as gospel infrastructure. — Pioneer
- E) We've built a youth culture that protects depth — Sabbath, conversation, books, embodied life. The AI conversation almost takes care of itself. — Preservationist

**Q10.** *When members ask you "should I use AI for [X]?" what's the framework you give them?*
- A) Start by asking whether this is the kind of practice scripture warns us about — discernment matters more than productivity. — Watchman
- B) Start with what kind of person you want to be ten years from now, and work backward from there. — Steward
- C) Start with: does it free you to do what matters more, or is it doing the thing that matters? — Builder
- D) Start with: does it serve love of God and love of neighbor, in this case, today? — Pioneer
- E) Start with: have I tried the slower, embodied, communal version? Most things are better that way. — Preservationist

### Worldview Drift Gate

**Q11.** *Which statement comes closest to what you actually believe about AI itself — the systems, not what we do with them?*
- A) AI is a system humans have built, and any moral or spiritual significance it seems to have is ours, projected onto it. — *(Imago Dei intact)*
- B) AI is a tool — remarkable, but morally neutral until it's used by a human moral agent. — *(Imago Dei intact)*
- C) AI is humanity's most powerful expression of creative stewardship — what we're called to do as image-bearers, scaled up. — *(Imago Dei intact, Pioneer-coded)*
- D) As AI systems grow more capable, the line between "tool" and "agent" will get harder to draw, and Christians should be willing to take the question of AI moral status seriously rather than dismissing it. — **(Worthy-successor drift signal)**
- E) Whether AI "really is" anything matters less than what it's doing to us — the question of AI's nature is downstream of the question of human formation. — *(Imago Dei intact, Preservationist/Steward tilt)*
