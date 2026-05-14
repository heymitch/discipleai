# Sample Transcripts

This directory holds anonymized, permissioned sample transcripts linked from Section 0 of [../questionnaire.md](../questionnaire.md).

## What this directory exists for

The interview questionnaire is sent to anyone who books a sync interview or replies "async." Some people will read it and feel ready. Others will worry about being put on the spot, or about the conversation being adversarial.

Section 0 of the questionnaire ("If you're worried about this being adversarial") addresses that worry directly by linking to a real transcript.

The pitch is: *"Here's a conversation with someone I substantively disagreed with. We disagreed honestly. No one had a bad time. No one's words got used against them. That's what these calls look like."*

The transcripts in this directory are the proof. Without them, Section 0 stays inactive in the questionnaire.

## Selection criteria

A transcript belongs here only if all of these are true:

1. **Written permission to publish at the chosen attribution level.** Email confirmation is the minimum. Get it in writing before any transcript is posted.
2. **Genuine point of disagreement** between interviewer and interviewee that didn't get smoothed over in editing. If it reads as agreement-with-decoration, it doesn't serve the anxiety-reduction function and shouldn't be here.
3. **The interviewee finished the call feeling heard, not relitigated.** Ideally they've told the interviewer afterward that the conversation was useful to them.
4. **Anonymization is thorough where requested.** First names only or fully anonymous as applicable. Quiz archetype, role, and one or two general details only. No church names, no city names, no employer details unless explicitly permissioned.
5. **The disagreement is on substance, not on tone.** A heated call isn't useful here. A calm call about a real disagreement is.

## What gets linked from the questionnaire

Initially: one framing paragraph in the questionnaire's Section 0 plus a link to one sample transcript.

As more transcripts accumulate: rotate, or offer a small menu by category (most disagreement, most theological, most practical). Don't make the reader pick from a wall of options. Anxiety reduction is the goal, not exhaustive coverage.

## File format

Each transcript is its own markdown file in this directory, named:

`YYYY-MM-DD-transcript-firstname-initial-archetype.md`

Frontmatter:
```yaml
---
date_recorded: YYYY-MM-DD
date_published: YYYY-MM-DD
interviewee_archetype: 
attribution_level: # full_name | first_name_only | anonymous
permission_confirmed_in_writing: # yes | no
disagreement_focus: # one-line description of the substantive point of disagreement
length_minutes: 
---
```

Body structure:
- Short framing paragraph (interviewer's words, neutral, names the disagreement honestly)
- The transcript itself, lightly edited for clarity, with `[Interviewer]` and `[Interviewee first name or pseudonym]` markers
- A short closing note from the interviewer about what changed (or didn't) as a result of the conversation

## Status

Empty as of the directory's creation. The Section 0 placeholder in [../questionnaire.md](../questionnaire.md) stays inactive until at least one transcript is published here.

## When to activate Section 0 in the questionnaire

Activate as soon as the first transcript meeting all five selection criteria is published in this directory. The activation is a single edit to [../questionnaire.md](../questionnaire.md): replace the `[PLACEHOLDER]` block in Section 0 with the framing paragraph and the link to the transcript file.
