---
sequence: Disciple AI Quiz → Interview Nurture
email_number: 1
send_day: 0
trigger: Quiz opt-in completed
status: READY TO LOAD
primary_cta: Reply to email
secondary_cta: Calendly link in P.S.
segment: All quiz-completers
---

# Email 1 — Day 0 — Quiz Result Snapshot

## Subject line options (A/B test AB-01)

- A: Your quiz result, and a quiet question
- B: Re: the quiz, {{first_name}}
- C: Read your snapshot first

## Preview text

What to do with your quiz result before you put it away.

## Body

{{first_name}},

You took the quiz. Thank you.

Your result is at the bottom of this email, or in the link if you opted to have it sent over.

I want to be honest about what these results actually are. They're a snapshot. A picture of where you are, today, in the middle of a question the church is barely starting to ask.

Men who finish the quiz often write back with some version of the same line. They knew what they thought going in, and the result told them something different.

That gap is where the interesting part lives. That's what I want to hear about.

Hit reply and tell me one thing your result got right, and one thing it got wrong.

Mitch

**P.S.** If you'd rather talk it through, you can grab 15 minutes on my calendar: [calendly.com/discipleai](https://calendly.com/discipleai). Sync or async, however works for you.

## Notes for KIT setup

- Trigger: quiz form submission
- Delay: send immediately on opt-in
- Personalization tokens: `{{first_name}}`, quiz result block at bottom (or link)
- Reply destination: monitored inbox (flag replies for human follow-up)
- Exit condition: any reply OR Calendly booking → flag for human review, do not block sequence
