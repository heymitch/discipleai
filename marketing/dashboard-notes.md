# Marketing Dashboard Notes

Working spec for the Disciple AI Marketing Dashboard. This file captures the metrics, sources, and benchmarks needed to instrument the quiz-to-interview nurture sequence. Use as the build doc when standing up the actual dashboard.

## Sequence in scope

**Disciple AI Quiz → 1:1 Interview Nurture** (five-email sequence)

Audience: Christian men who completed the AI quiz lead magnet on the Disciple AI landing page.

Goal: Convert quiz opt-ins into booked 15-30 min interviews via Calendly (sync) or async voice-memo / written-reply track.

## Primary conversion events

| Event | Definition | Weight |
|---|---|---|
| `interview_booked` | Calendly event confirmed against an email captured at quiz opt-in | 1.0 |
| `async_reply` | Inbound reply containing the trigger word "async" | 1.0 |
| `forward_referral` | New quiz opt-in attributed via shared UTM link from Email 2 | 0.25 (secondary KPI) |

Both `interview_booked` and `async_reply` are full conversions. Same downstream value: a conversation captured.

## Per-email metrics

Track per email (1-5) and aggregated:

- `delivered`
- `opened` (unique opens, open rate)
- `clicked` (unique clicks, CTR)
- `replied` (reply count, reply rate) — important especially on emails 1, 2
- `unsubscribed` (count, rate)
- `bounced` (hard / soft)

## Sequence-level metrics

- Opt-ins entering sequence (daily, weekly, cumulative)
- Exits by reason: `booked`, `async`, `unsubscribed`, `completed_all_5`
- Overall conversion rate = (`interview_booked` + `async_reply`) / opt_ins
- Time-to-conversion (days from quiz completion to booking)
- Email-of-conversion (which email was last opened/clicked before the booking event)
- Drop-off heatmap (unsubscribes by email number)
- Forward / referral rate from Email 2 (per-recipient share URL with UTM)

## Benchmark targets

| Metric | Floor | Target | Strong |
|---|---|---|---|
| Open rate (avg across 5 emails) | 30% | 40% | 50%+ |
| CTR on emails 3, 4, 5 | 6% | 10% | 15%+ |
| Booking + async rate (overall sequence) | 6% | 10% | 15%+ |
| Reply rate (emails 1 and 2) | 3% | 6% | 10%+ |
| Unsubscribe rate (cumulative) | <3% | <2% | <1% |
| Forward / referral rate from Email 2 | 1% | 3% | 6%+ |

These are warm-lead research-recruitment benchmarks, not standard lead-nurture. The primary conversion is a conversation, not a purchase, so we expect higher CTR-to-booking conversion than a typical product nurture.

## A/B test register

| Test ID | Email | Variable | Variant A | Variant B | Primary metric | Min sample per arm | Status |
|---|---|---|---|---|---|---|---|
| AB-01 | E1 | Subject line tone | "Your quiz result, and a quiet question" | "Re: the quiz, {{first_name}}" | Reply rate (not open rate) | 200 opens | Pending launch |
| AB-02 | E3 | Structure | Scripture-led (Daniel in Babylon framing first) | Ask-led (interview ask in paragraph 2, scripture as support) | CTR to Calendly | 150 sends | Pending launch |
| AB-03 | E5 | P.S. social proof shape | Qualitative ("conversations have been useful to them") | Quantitative ("X men have said yes so far") | Booking rate | 200 sends | Blocked: needs honest number |

Notes on AB-01: the right winner is the higher *reply* rate, not the higher open rate. A clickbait subject can lift opens but suppress the warm-feel reply behavior we want.

## Review cadence

- **Weekly**: per-email funnel, A/B test progress, anomaly check
- **Bi-weekly**: drop-off heatmap, conversion-by-email analysis
- **Monthly**: cohort comparison (this month vs last), sequence-level conversion trend
- **Quarterly**: full sequence retro, decide whether to restructure or add Email 6 graceful-exit

## Data sources and instrumentation needed

- **ESP webhook** to events table for `sent`, `delivered`, `opened`, `clicked`, `replied`, `unsubscribed`, `bounced`
- **Calendly webhook** to events table for `interview_booked` (capture invitee email, event time, source)
- **Inbox parser** or ESP reply-label rule for `async_reply` (match on word "async" in body)
- **Quiz form** opt-in event with full quiz result payload (so we can segment dashboard by quiz result group)
- **Per-recipient share URL** with UTM for Email 2 forward tracking (e.g., `quiz.discipleai.com?ref={{contact_id}}`)

## Suppression and counting rules

- Don't count an opt-in as entering the sequence until Email 1 is `delivered`
- Don't count a conversion before suppressions: if recipient unsubscribed before Email N, they're out of the denominator for emails N+ but still in the overall sequence denominator
- Count distinct senders for reply rate, not distinct messages (one reply per recipient)
- For the email-of-conversion attribution: last opened OR clicked email within 72 hours of the booking event
- Async replies: dedupe by email address, keep first occurrence

## Open questions to resolve before instrumentation starts

1. Calendly account: single owner (Mitch) or round-robin? Affects `assigned_owner` field on the booking record.
2. Async reply parsing: regex on the word "async" in the reply body, or a dedicated reply address (e.g., `async@discipleai.com`)?
3. Storage and visualization layer: Google Sheets + Looker Studio, Supabase + Metabase, or Notion database? Decision drives which webhook destinations get configured.
4. PII handling: are interview transcripts and quiz results stored alongside contact records, or in a separate research-data store?
5. Backfill: do we have historical data from any earlier quiz-to-interview attempts to seed benchmarks, or are these all forward-looking?

## Out of scope for v1 dashboard

- Multi-touch attribution across the weekly newsletter and the nurture sequence (revisit once weekly newsletter is also instrumented)
- Cohort analysis by quiz result group (track the data, but don't surface the dashboard view until n > 100 per group)
- LTV / book-purchase attribution (the book doesn't exist yet)
