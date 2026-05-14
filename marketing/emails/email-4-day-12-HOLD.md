---
sequence: Disciple AI Quiz → Interview Nurture
email_number: 4
send_day: 12
trigger: 5 days after Email 3 delivery
status: HOLD — DO NOT LOAD INTO KIT YET
primary_cta: Book interview via Calendly
segment: All who haven't booked
hold_reason: Body contains a fabricated interview anecdote. Rewrite required from real conversation data before any send.
---

# Email 4 — Day 12 — STRUCTURAL SHELL ONLY

> **DO NOT SEND.** The body below is a structural template demonstrating the email's role in the sequence (social proof through a specific interviewee moment that surfaces "the thing underneath the thing"). The fictional "dad with two kids in middle school" story MUST be replaced with a real, anonymized moment from an actual interview before this email is loaded into KIT.

## What this email needs to do (purpose, not copy)

This email sits between Email 3's first explicit interview ask and Email 5's direct vulnerable ask. Its job is to make the interview format feel concrete and trustworthy by showing what actually happens in one.

The mechanism is **a single specific moment from a real conversation**. Not a summary. Not aggregate insights. One small admission or sentence that surfaced something the interviewee hadn't expected to find. The reader should finish the email with the feeling, "Oh. That's what one of these calls actually does."

## Real-story capture roadmap

To replace the placeholder, capture these from your first 5-10 real interviews:

1. **One sentence the person said** that they themselves were surprised by. Verbatim if possible. Get explicit permission to quote.
2. **A two-line context** for who they are. Specific enough to be real (dad of teenagers, pastor of a small church, software engineer who teaches Sunday school), generic enough not to identify them.
3. **Which of the five archetypes their quiz returned** (Watchman, Steward, Builder, Pioneer, or Preservationist) and any meaningful dimension scores. The archetype matters because the moment in question often reveals tension between the strong form of their stance and what they actually do on a Tuesday.
4. **The micro-shift** the moment produced. What did they realize, decide, or sit with after.
5. **Permission status**: anonymous, first-name only, or full attribution? Confirm in writing.

When you have at least one usable moment, rewrite the body of this email around it, keeping the structural beats below.

## Structural beats to preserve in the rewrite

1. **Opening anchor** — "I had a call last week with a reader who took the same quiz you did." (Or similar concrete time-marker that makes the moment feel recent.)
2. **Two-line context** — Who they are, in just enough detail.
3. **Their quiz result** — One line connecting them to a result the reader can place themselves against.
4. **The moment** — One specific sentence or admission. The smallest possible unit.
5. **The micro-shift** — One observation about what the moment did, not what you think it means.
6. **The bridge** — "We weren't on the call to figure out [their topic]. We were there to talk about the quiz result. The quiz, it turns out, has a way of surfacing the thing underneath the thing."
7. **The ask** — "If yours has a thing underneath the thing, I'd love to hear it." Calendly link.
8. **P.S.** — Permission note if the story is shared with permission.

## Placeholder body (DO NOT SEND, structural reference only)

### Subject line options

- A: I keep thinking about a 10-minute moment from last week's call
- B: [Specific quote fragment from real moment]
- C: The thing underneath the thing

### Preview text

A small admission from another reader that changed how I think about the whole question.

### Body (PLACEHOLDER — fictional, do not send)

I had a call last week with a reader who took the same quiz you did.

[REAL CONTEXT GOES HERE: two lines about who they are, drawn from a real interview. Specific enough to be human, generic enough to protect them. Include their archetype if relevant: "His quiz came back as [Watchman / Steward / Builder / Pioneer / Preservationist]."]

The thing he said that I keep coming back to was this. [REAL QUOTE OR PARAPHRASE WITH PERMISSION. One sentence, verbatim where possible.]

[REAL MICRO-OBSERVATION about the moment. One sentence about what it did, not what it "meant."]

We weren't on the call to figure out [their topic]. We were there to talk about his quiz result. The quiz, it turns out, has a way of surfacing the thing underneath the thing.

That's why I keep asking for these calls. People show up to talk about their score and end up finding the question they actually needed to sit with.

If yours has a thing underneath the thing, I'd love to hear it.

[Grab a slot on Calendly](https://calendly.com/discipleai)

15 to 30 minutes. Sync or async, your call.

Mitch

**P.S.** [Permission line: confirm what was shared and how. e.g., "The story above is shared with his permission. His name isn't in it because he asked it not be."]

## Notes for KIT setup (after rewrite)

- Trigger: 5 days after Email 3 delivered
- DO NOT enable this email in KIT until the placeholder body is replaced with a real-conversation moment
- Personalization tokens: none in body, but consider quiz-result-segmented variants once enough interview data exists per result group
- Exit condition: Calendly booking → exit sequence

## Replacement workflow

1. Conduct 5-10 real interviews via Email 3 and Email 5 of this sequence (initial pre-launch outreach to existing list works too)
2. After each interview, fill out `interviews/notes/TEMPLATE.md` and save the completed copy to `interviews/notes/YYYY-MM-DD-firstname-initial-archetype.md`
3. Pick the strongest single moment that fits the structural beats
4. Confirm written permission for the level of attribution
5. Rewrite the body, removing all HOLD markers
6. Move file from `email-4-day-12-HOLD.md` to `email-4-day-12.md`
7. Run AI Hunter on the rewritten version before loading into KIT
8. Load into KIT and enable the trigger
