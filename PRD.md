# Disciple AI — Church Leadership Quiz PRD

**Status:** In progress (brainstorming phase)
**Last updated:** 2026-05-14
**Owner:** Mitch

## Purpose

A free, shareable quiz lead magnet for the Disciple AI Substack newsletter.

- **Primary mission:** Source thinkers (pastors, ministry leaders, seminary thinkers, Christian writers) who will share their thinking on AI + church with our audience. Leads are interview prospects, not subscribers — the funnel exit is an opt-in to a 15–30 minute conversation (coffee on Mitch for Arizona locals).
- **Secondary mission:** Generate editorial fodder for the newsletter via aggregate analysis of quiz responses.
- **Tertiary mission:** Build a Christian-worldview-coded dataset on AI readiness that doesn't exist anywhere else.

90% of paid subscription revenue from the newsletter funds charity for AI-displaced workers; 10% funds the operation (tools, subscriptions, hardware).

## Quiz Mechanics (locked in brainstorming)

- **11 questions** (10 dimension questions + 1 dedicated worldview-drift-gate question)
- **5 archetypes:** Watchman, Steward, Builder, Pioneer, Preservationist
- **5 grades:** A, B, C, D, F — all archetypes scorable A through F (no Ostrich asymmetry)
- **5 scoring dimensions:** Theological Clarity, Pastoral Integrity, Operational Alignment, Cultural Discernment, Discipleship Formation
- **Positive framing rule:** every answer option must be defensible within its archetype. No detectable "right answers." Grade emerges from cross-question pattern coherence, not individual answers
- **Worldview drift gate:** dedicated question that detects worthy-successor / AI-personhood drift in any archetype, with explicit grade-cap mechanic for Pioneer (caps at B; flagged as caveat for others)

## Result Page

Single-page, shareable. Anatomy:
1. Archetype label + grade headline
2. Personalized result paragraph
3. 5-dimension breakdown (mini report card)
4. Worldview-drift caveat if triggered
5. Email capture framed as: "Willing to talk further? 15–30 minute conversation. Arizona locals: coffee on me." Email is opt-in to interview, not newsletter (though newsletter subscribe is a secondary offer).
6. Share buttons

## Data We're Collecting

Per quiz submission, we record:
- Timestamp, anonymized session ID
- All 11 question responses (archetype-encoded answer keys)
- Computed primary archetype
- Computed grade (A/B/C/D/F)
- Per-dimension sub-grades (5 scores, A–D)
- Worldview-drift flag (boolean + which question triggered it)
- Email (if provided), name, role
- Interview opt-in (boolean)
- Group/congregation v2 notify-list opt-in (boolean) — demand signal for the v2 lead magnet
- Kit (CRM) opt-in (boolean) — separate from the Substack newsletter; Kit is the personal-outreach / per-archetype email-content layer
- Local-to-Arizona flag
- Referrer / source URL (which post, channel, or share-link drove the visit)
- Consent: outreach-only. Quiz responses and personal info are **never** published, quoted, or attributed without explicit, separately-obtained written permission. Aggregate stats use only anonymized computed fields.

## Editorial Breakdowns We Can Publish

Newsletter content engine fueled by the data:

1. **Archetype deep-dives** — one mega-resource post per archetype covering: biblical basis, church-history artifacts and thinking tools (e.g., C.S. Lewis's *That Hideous Strength* for Preservationist/Watchman), advantages, disadvantages, temptations, recommended reading. Each archetype gets an email-course-style breakdown.
2. **Cross-archetype temptation maps** — what tempts each type when they drift (e.g., Pioneer → worthy-successor; Builder → AI-generated soul-care; Preservationist → smug isolation; Watchman → fear paralysis; Steward → policy theater).
3. **Aggregate stats pieces** — "We surveyed N pastors: X% scored D or F on Discipleship Formation regardless of archetype," etc.
4. **Cross-tab analyses** — Builders with highest Pastoral Integrity; Watchmen with highest Mission scores; Preservationists who'd consider a single AI use case.
5. **Worthy-successor exposé** — feature piece on the worthy-successor failure mode using anonymized data from the drift gate question.
6. **Per-archetype prompt/skill series** — practical resources tailored to each archetype's posture (including a "no AI tools, just books" series for Preservationists pointing to Lewis, Ellul, Postman, Wendell Berry, etc.).
7. **Denominational and geographic cuts** — if we collect denomination, we can publish "How SBC vs. ELCA vs. PCA churches score on each dimension."

## Anti-Enneagram Principle

The Enneagram took over evangelical culture by being shareable and labeled but ended up flattening real theological work. We borrow the *form* (typing quiz, shareable archetype, deep-dive resource per type) without the *failure mode* (treating archetypes as fixed identity rather than diagnostic snapshot). Every archetype write-up names its *temptations and failure modes* alongside its strengths, and grounds in scripture and church history rather than esoteric tradition.

## Analytics Dashboard

End-of-project deliverable. Required views:
- Quiz funnel: visits → starts → completions → email-given → interview-opt-in → interview-completed
- Archetype distribution over time
- Grade distribution within each archetype
- Per-dimension averages and outliers
- Worthy-successor drift incidence
- Email-capture conversion rate by archetype (do Pioneers convert higher than Watchmen?)
- Source attribution (which Substack posts / channels drive the highest-quality leads)
- Geographic distribution (Arizona-local prioritized)

## Status

- Brainstorming and design **complete** 2026-05-14
- Full design spec lives at [docs/superpowers/specs/2026-05-14-ai-church-leadership-quiz-design.md](docs/superpowers/specs/2026-05-14-ai-church-leadership-quiz-design.md)
- Awaiting user review of the spec, then implementation plan via writing-plans skill

## Remaining Open Items

- Calendly URL for the success state (Mitch to provide before launch; spec supports passing it via environment variable)
