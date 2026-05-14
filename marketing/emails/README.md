# Disciple AI — Quiz to Interview Nurture Sequence

Five-email nurture from quiz opt-in to booked 1:1 interview. Audience: Christian men who completed the AI quiz lead magnet.

## Load order and status

| # | File | Day | Status | Notes |
|---|---|---|---|---|
| 1 | [email-1-day-0.md](email-1-day-0.md) | 0 | READY | Sends immediately on quiz opt-in |
| 2 | [email-2-day-3.md](email-2-day-3.md) | 3 | READY (verify distribution) | Rewritten to use the 5 actual quiz archetypes. Soften "early conversations" line for first wave if no interviews exist yet. |
| 3 | [email-3-day-7.md](email-3-day-7.md) | 7 | READY | First headline-level Calendly CTA |
| 4 | [email-4-day-12-HOLD.md](email-4-day-12-HOLD.md) | 12 | **HOLD** | Needs real interview moment before send. See roadmap inside file. |
| 5 | [email-5-day-18.md](email-5-day-18.md) | 18 | READY (caveat on P.S.) | Soften P.S. for first send wave before any interviews exist |

## Loading into KIT

For each ready email:

1. Create new broadcast or sequence email in KIT
2. Copy subject line option A as default; set options B and C as A/B test variants where applicable (see `dashboard-notes.md` for the test register)
3. Copy preview text
4. Copy body. KIT supports basic markdown / rich text. The `{{first_name}}` token in Email 1 maps to KIT's first name merge tag.
5. Set send delay per the frontmatter (`send_day` is days after Email 1 delivery for emails 2-5)
6. Set exit conditions per the file's `Notes for KIT setup` section
7. Connect Calendly webhook so booking triggers sequence exit

## Calendly setup

Calendar URL throughout sequence: `https://calendly.com/discipleai` (placeholder, swap for actual link).

Configure Calendly to:
- Capture invitee email
- Send webhook to KIT or your event store on event creation
- Send confirmation email separate from this sequence

## Reply handling

Email 1 and Email 2 invite direct replies. Email 5 has an "async" trigger word.

- All replies should land in a monitored inbox
- "async" replies should be tagged for human follow-up to send the async questionnaire (not yet written)
- General replies to Email 1 and Email 2 should be flagged for review but the sequence should continue unless the recipient books or unsubscribes

## Related files

- [../dashboard-notes.md](../dashboard-notes.md) — Marketing dashboard spec with metrics, benchmarks, A/B register, instrumentation needs
- [../interviews/README.md](../interviews/README.md) — Interview directory: the questionnaire that gets sent on booking/async reply, the notes template, the sample-transcripts spec
- [../interviews/questionnaire.md](../interviews/questionnaire.md) — The flexible interview structure (sent as a reply to async opt-ins and as pre-call prep for sync bookings)
- [../ai-quiz/content/questions.json](../../ai-quiz/content/questions.json) — Source of truth for the 5 quiz archetypes referenced in Email 2 and the questionnaire
