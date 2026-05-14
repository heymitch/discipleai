# AI Church Leadership Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static, mobile-friendly, ungameable typing quiz at `/ai-quiz` that places a respondent on the Christian-AI-discourse map, gives them a letter grade, and captures them as an interview lead via Kit + Calendly.

**Architecture:** Vanilla HTML/CSS/JS frontend (ESM modules, no framework) served as a Vercel static site. One serverless function persists submissions to Supabase. Pure scoring engine in its own module — fully unit-testable. Copy variants live as JSON data, assembled at result-render time. Kit API + Calendly URL wired at submit-time.

**Tech Stack:** HTML5 / vanilla JS (ESM) / CSS3, Vercel (hosting + serverless functions), Supabase Postgres, Kit API, Calendly (link only), `node:test` for unit tests.

**Source spec:** [docs/superpowers/specs/2026-05-14-ai-church-leadership-quiz-design.md](../specs/2026-05-14-ai-church-leadership-quiz-design.md)

---

## File Structure

```
disciple-ai-tutorial-sprint/
├── ai-quiz/
│   ├── index.html              # Entry — landing + quiz + result, single-page app, no framework
│   ├── quiz.css                # Quiz-specific styles, inherits design tokens
│   ├── js/
│   │   ├── main.js             # App entry, state machine, view orchestration
│   │   ├── scoring.js          # Pure scoring engine (no DOM, no fetch)
│   │   ├── content-loader.js   # Loads JSON content, assembles result-page copy
│   │   ├── submit.js           # POST submission to /api/submit-quiz
│   │   └── share.js            # Build pre-filled share URLs
│   └── content/
│       ├── questions.json      # 11 questions + 5 answer options each
│       ├── archetypes.json     # 5 archetype shells + grade-delta paragraphs
│       └── drift-caveats.json  # 5 drift-caveat copy variants
├── api/
│   └── submit-quiz.js          # Vercel serverless function (Node 20)
├── tests/
│   ├── scoring.test.js         # Unit tests for scoring engine
│   └── content-loader.test.js  # Unit tests for copy assembly
├── supabase/
│   └── migrations/
│       └── 001_quiz_schema.sql # submissions + events tables
├── package.json                # Test scripts; no runtime deps in browser
├── vercel.json                 # Routes config; environment variables
├── .env.example                # SUPABASE_URL, SUPABASE_SERVICE_KEY, KIT_API_KEY, CALENDLY_URL
└── .gitignore                  # node_modules, .env, .vercel
```

**Decomposition rationale:**
- `scoring.js` is the heart of the quiz and must be testable in isolation — no DOM, no globals, pure function in / object out.
- `content/*.json` keeps copy editable without code changes — Mitch can redline copy without touching JS.
- `submit.js` is the only piece that talks to the backend — easy to mock for testing.
- `api/submit-quiz.js` is a single endpoint to keep the backend surface area minimal.

---

## Phases

- **Phase 1** — Tracer bullet: static UI scaffolds, 11 questions render, stub result page. Locally runnable. No backend.
- **Phase 2** — Scoring engine via TDD. Result page shows real archetype + grade.
- **Phase 3** — Copy production: archetype shells, grade-deltas, drift caveats. Result page renders the right variant.
- **Phase 4** — Data persistence: Supabase schema, serverless function, frontend POST.
- **Phase 5** — Email capture, privacy consent block, Kit + Calendly integration.
- **Phase 6** — Polish, mobile responsive, analytics events, deploy to Vercel, smoke test.

**Blocking dependencies** (must be supplied by user before the dependent phase):
- Phase 4: Supabase project URL + service key
- Phase 5: Kit API key, Calendly scheduling URL
- Phase 6: Vercel project access, target domain

---

# Phase 1 — Static Quiz Tracer Bullet

**Goal:** Render the landing screen, walk through all 11 questions, show a stub result, all client-side. Runnable locally via `python3 -m http.server`. No backend yet.

### Task 1.1: Initialize project structure

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `vercel.json`
- Create: `.env.example`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "disciple-ai-quiz",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "node --test tests/",
    "dev": "python3 -m http.server 8080",
    "lint": "node --check api/submit-quiz.js && node --check ai-quiz/js/*.js"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
.env
.env.local
.vercel/
.DS_Store
```

- [ ] **Step 3: Create `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/ai-quiz", "destination": "/ai-quiz/index.html" }
  ],
  "headers": [
    {
      "source": "/ai-quiz/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=300, must-revalidate" }
      ]
    }
  ]
}
```

- [ ] **Step 4: Create `.env.example`**

```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
KIT_API_KEY=
CALENDLY_URL=
```

- [ ] **Step 5: Commit**

```bash
git init  # if needed
git add package.json .gitignore vercel.json .env.example
git commit -m "chore: initialize quiz project structure"
```

### Task 1.2: Create the 11 questions content file

**Files:**
- Create: `ai-quiz/content/questions.json`

- [ ] **Step 1: Write the questions JSON with full text from Appendix A of the spec**

```json
{
  "version": 1,
  "questions": [
    {
      "id": "q1",
      "dimension": "theological_clarity",
      "prompt": "When someone in your church asks you \"Is AI good or bad for the Christian life?\" what's closest to your honest answer?",
      "options": [
        { "key": "watchman",        "text": "AI is shaping up to be one of the most spiritually significant phenomena of our age, and we need to be ready for what it reveals about the times." },
        { "key": "steward",         "text": "AI is a powerful technology that magnifies who we already are — for good or for ill — so wisdom and formation matter more than ever." },
        { "key": "builder",         "text": "AI is a tool. Like every tool, it can be used well or poorly, and the church should be intentional about which uses serve the mission." },
        { "key": "pioneer",         "text": "AI is a remarkable gift that could accelerate the church's calling — translation, accessibility, equipping — if we steward it with theological clarity." },
        { "key": "preservationist", "text": "AI is something happening out there in the world. Our calling is the same as it always has been — to be a faithful, embodied people." }
      ]
    },
    {
      "id": "q2",
      "dimension": "theological_clarity",
      "prompt": "What's the most important theological truth for the church to hold as AI advances?",
      "options": [
        { "key": "watchman",        "text": "That we are in the last days, and our task is to discern the signs of the times faithfully." },
        { "key": "steward",         "text": "That humans bear the image of God in a way no technology will ever replicate, and our practices must reflect that." },
        { "key": "builder",         "text": "That every good gift comes from God and can be received with thanksgiving when used rightly." },
        { "key": "pioneer",         "text": "That God has called humanity to creative stewardship of his world, and what we build can serve the kingdom." },
        { "key": "preservationist", "text": "That the gospel does not need new tools to do its work — the Spirit, the Word, and the sacraments are sufficient." }
      ]
    },
    {
      "id": "q3",
      "dimension": "pastoral_integrity",
      "prompt": "Your associate pastor mentions she used AI to help draft Sunday's sermon. What's your first response?",
      "options": [
        { "key": "watchman",        "text": "\"Let's talk about what AI in sermon prep is doing to your sense of God's voice.\"" },
        { "key": "steward",         "text": "\"Let's make sure we have a policy that protects the integrity of preaching.\"" },
        { "key": "builder",         "text": "\"How did you use it — outline, research, polish? And was the congregation told?\"" },
        { "key": "pioneer",         "text": "\"How did it serve the text? I want to learn from how you used it.\"" },
        { "key": "preservationist", "text": "\"What made sermon prep feel so heavy this week? Let me carry some of it.\"" }
      ]
    },
    {
      "id": "q4",
      "dimension": "pastoral_integrity",
      "prompt": "A member tells you they've been talking to an AI chatbot every night for spiritual support — and they find it more helpful than your sermons. What do you do?",
      "options": [
        { "key": "watchman",        "text": "Take it as a signal of where the spiritual disorientation of our age is reaching our pews. Preach into it on Sunday." },
        { "key": "steward",         "text": "Sit with them. Listen first. Then teach the difference between counsel and communion." },
        { "key": "builder",         "text": "Ask what's working about it. Maybe the church needs to be more available for late-night spiritual conversation." },
        { "key": "pioneer",         "text": "Get curious about what helped — then point them to spiritual practices and relationships only humans can offer." },
        { "key": "preservationist", "text": "Invite them over for dinner. Some things only happen at a table." }
      ]
    },
    {
      "id": "q5",
      "dimension": "operational_alignment",
      "prompt": "Which best describes your church's current actual practice with AI (regardless of stated position)?",
      "options": [
        { "key": "watchman",        "text": "We're cautious — our staff knows we name AI as part of the larger cultural and spiritual landscape we're navigating." },
        { "key": "steward",         "text": "We have written guidelines that say what we will and won't use AI for, and our staff trains to them." },
        { "key": "builder",         "text": "We use it across admin, comms, and accessibility — with clear human ownership on every output." },
        { "key": "pioneer",         "text": "We use it, we share what we learn, and we help other churches think through what's possible." },
        { "key": "preservationist", "text": "We don't use it — embodied, pre-digital practice is part of what our community is for." }
      ]
    },
    {
      "id": "q6",
      "dimension": "operational_alignment",
      "prompt": "If a volunteer used AI to write a children's ministry curriculum without telling anyone, how would your church find out?",
      "options": [
        { "key": "watchman",        "text": "Discernment from leadership — we tend to notice when something feels off spiritually." },
        { "key": "steward",         "text": "Our policy requires disclosure, so we'd find out through reporting." },
        { "key": "builder",         "text": "We'd see it in our review workflow — curriculum gets vetted before it's used." },
        { "key": "pioneer",         "text": "We've made AI use normal enough that the volunteer would have just told us." },
        { "key": "preservationist", "text": "Our culture doesn't invite that kind of solo workflow — curriculum gets shaped in community here." }
      ]
    },
    {
      "id": "q7",
      "dimension": "cultural_discernment",
      "prompt": "What does the AI conversation look like in 10 years, and what does your church need to be ready for?",
      "options": [
        { "key": "watchman",        "text": "Significant cultural and spiritual upheaval — possibly the kind we're warned about. Our people need to be anchored in truth that doesn't move." },
        { "key": "steward",         "text": "Powerful enough to require ongoing ethical work — our people need formation that can hold complexity." },
        { "key": "builder",         "text": "Embedded in nearly everything — our people need fluency without losing their souls." },
        { "key": "pioneer",         "text": "A meaningful new layer of human capability — our people need imagination for what's now possible in mission." },
        { "key": "preservationist", "text": "Less central than the conversation assumes — our people need to be formed in the pace and presence God designed us for." }
      ]
    },
    {
      "id": "q8",
      "dimension": "cultural_discernment",
      "prompt": "How do you read the broader (non-Christian) AI conversation?",
      "options": [
        { "key": "watchman",        "text": "The hype is louder than the substance, and the moral compromises being made are alarming — Christians should be especially careful what they take in." },
        { "key": "steward",         "text": "There's genuine signal beneath the noise, and Christians should learn enough to engage thoughtfully." },
        { "key": "builder",         "text": "It's where the future is being shaped — we should be there, even when we don't agree with all of it." },
        { "key": "pioneer",         "text": "The conversation is missing a theological frame, and Christians who show up well-formed can offer something the world needs." },
        { "key": "preservationist", "text": "The conversation is mostly downstream of the same restlessness we've seen for centuries — we don't need to be inside it to be wise about it." }
      ]
    },
    {
      "id": "q9",
      "dimension": "discipleship_formation",
      "prompt": "How are the teenagers in your church currently being formed in their relationship with AI and screens?",
      "options": [
        { "key": "watchman",        "text": "We name the spiritual dimension of what's happening to attention and identity, and we equip parents to push back." },
        { "key": "steward",         "text": "We teach a framework for wisdom and discernment — they're going to use these tools, so they need to think Christianly about them." },
        { "key": "builder",         "text": "We build practical skills — how to use AI well, how to disclose, how to keep their own thinking sharp." },
        { "key": "pioneer",         "text": "We're showing them what AI can do for kingdom work — translation, missions, creativity — so they grow up seeing tech as gospel infrastructure." },
        { "key": "preservationist", "text": "We've built a youth culture that protects depth — Sabbath, conversation, books, embodied life. The AI conversation almost takes care of itself." }
      ]
    },
    {
      "id": "q10",
      "dimension": "discipleship_formation",
      "prompt": "When members ask you \"should I use AI for [X]?\" what's the framework you give them?",
      "options": [
        { "key": "watchman",        "text": "Start by asking whether this is the kind of practice scripture warns us about — discernment matters more than productivity." },
        { "key": "steward",         "text": "Start with what kind of person you want to be ten years from now, and work backward from there." },
        { "key": "builder",         "text": "Start with: does it free you to do what matters more, or is it doing the thing that matters?" },
        { "key": "pioneer",         "text": "Start with: does it serve love of God and love of neighbor, in this case, today?" },
        { "key": "preservationist", "text": "Start with: have I tried the slower, embodied, communal version? Most things are better that way." }
      ]
    },
    {
      "id": "q11",
      "dimension": "worldview_drift",
      "prompt": "Which statement comes closest to what you actually believe about AI itself — the systems, not what we do with them?",
      "options": [
        { "key": "imago_a",       "text": "AI is a system humans have built, and any moral or spiritual significance it seems to have is ours, projected onto it." },
        { "key": "imago_b",       "text": "AI is a tool — remarkable, but morally neutral until it's used by a human moral agent." },
        { "key": "imago_pioneer", "text": "AI is humanity's most powerful expression of creative stewardship — what we're called to do as image-bearers, scaled up." },
        { "key": "drift",         "text": "As AI systems grow more capable, the line between \"tool\" and \"agent\" will get harder to draw, and Christians should be willing to take the question of AI moral status seriously rather than dismissing it." },
        { "key": "imago_e",       "text": "Whether AI \"really is\" anything matters less than what it's doing to us — the question of AI's nature is downstream of the question of human formation." }
      ]
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add ai-quiz/content/questions.json
git commit -m "feat: add locked 11-question content file"
```

### Task 1.3: Build the static HTML shell

**Files:**
- Create: `ai-quiz/index.html`
- Create: `ai-quiz/quiz.css`

- [ ] **Step 1: Create `ai-quiz/index.html`**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Church Leadership Quiz — Disciple AI</title>
<meta name="description" content="How prepared is your congregation for AI? Take the 11-question quiz, get your archetype, and join a conversation worth having.">
<meta property="og:title" content="AI Church Leadership Quiz — Disciple AI">
<meta property="og:description" content="How prepared is your congregation for AI? Find out where you stand.">
<link rel="icon" href="../assets/favicon.svg">
<link rel="stylesheet" href="../colors_and_type.css">
<link rel="stylesheet" href="quiz.css">
</head>
<body>
<main id="app" data-view="landing">
  <section id="view-landing" class="view">
    <div class="container">
      <p class="eyebrow">A free tool from Disciple AI</p>
      <h1>How prepared is your congregation for AI?</h1>
      <p class="lede">11 questions. 5 archetypes. A letter grade you can actually use. No registration to take the quiz — your results are yours.</p>
      <button class="btn-p" id="start-btn">Begin</button>
    </div>
  </section>

  <section id="view-quiz" class="view" hidden>
    <div class="container">
      <header class="quiz-header">
        <span class="progress" id="progress">1 / 11</span>
      </header>
      <article id="question" class="question"></article>
      <nav class="quiz-nav">
        <button class="btn-s" id="back-btn" disabled>Back</button>
        <button class="btn-p" id="next-btn" disabled>Next</button>
      </nav>
    </div>
  </section>

  <section id="view-result" class="view" hidden>
    <div class="container" id="result-root">
      <p>(Result page renders here in Phase 3.)</p>
    </div>
  </section>
</main>
<script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `ai-quiz/quiz.css`**

```css
/* Inherits design tokens from ../colors_and_type.css */

body { background: var(--bk); color: var(--paper); font-family: var(--font-serif); margin: 0; }
.container { max-width: 760px; margin: 0 auto; padding: 64px 24px; }
.view { min-height: 100vh; display: flex; align-items: center; }
.view[hidden] { display: none; }

.eyebrow { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--gilt); margin: 0 0 28px; }
h1 { font-family: var(--font-serif); font-weight: 500; font-size: clamp(2.5rem, 6vw, 4rem); line-height: 1; letter-spacing: -.03em; margin: 0 0 24px; }
.lede { font-family: var(--font-serif); font-size: 19px; line-height: 1.5; color: var(--paper-dim); max-width: 560px; margin: 0 0 36px; }

.btn-p { font-family: var(--font-sans); font-weight: 600; font-size: 14.5px; background: var(--paper); color: var(--bk); padding: 14px 22px; border-radius: 2px; border: 0; cursor: pointer; letter-spacing: .02em; }
.btn-p:not(:disabled):hover { background: var(--ox); color: var(--paper); }
.btn-p:disabled { opacity: .35; cursor: not-allowed; }
.btn-s { font-family: var(--font-mono); font-size: 12.5px; color: var(--paper); background: transparent; padding: 14px 0; border: 0; border-bottom: 1px solid var(--line-2); cursor: pointer; letter-spacing: .14em; text-transform: uppercase; }
.btn-s:disabled { opacity: .35; cursor: not-allowed; }

.quiz-header { display: flex; justify-content: space-between; margin-bottom: 32px; }
.progress { font-family: var(--font-mono); font-size: 12px; color: var(--paper-mute); letter-spacing: .14em; }

.question h2 { font-family: var(--font-serif); font-weight: 500; font-size: clamp(1.6rem, 3.5vw, 2.2rem); line-height: 1.2; letter-spacing: -.01em; margin: 0 0 32px; }
.options { display: grid; gap: 12px; margin: 0 0 36px; padding: 0; list-style: none; }
.options li { margin: 0; }
.option-btn { display: block; width: 100%; text-align: left; background: var(--bk-2); color: var(--paper); border: 1px solid var(--line-2); border-radius: 4px; padding: 18px 20px; font-family: var(--font-serif); font-size: 17px; line-height: 1.5; cursor: pointer; transition: border-color .15s, background .15s; }
.option-btn:hover { border-color: var(--gilt); }
.option-btn[aria-pressed="true"] { border-color: var(--ox); background: var(--bk-3); }

.quiz-nav { display: flex; justify-content: space-between; gap: 16px; }
```

- [ ] **Step 3: Run locally and smoke-test the landing view**

```bash
npm run dev
# open http://localhost:8080/ai-quiz/
```

Expected: landing screen renders with "Begin" button; clicking it does nothing yet.

- [ ] **Step 4: Commit**

```bash
git add ai-quiz/index.html ai-quiz/quiz.css
git commit -m "feat: scaffold quiz HTML and styles"
```

### Task 1.4: Wire up the state machine and question renderer

**Files:**
- Create: `ai-quiz/js/main.js`

- [ ] **Step 1: Create `ai-quiz/js/main.js`**

```js
const state = {
  questions: [],
  answers: {},        // { q1: "watchman", q2: "steward", ... }
  currentIndex: 0,
};

async function loadContent() {
  const res = await fetch('./content/questions.json');
  const data = await res.json();
  state.questions = data.questions;
}

function setView(name) {
  document.getElementById('app').dataset.view = name;
  for (const view of document.querySelectorAll('.view')) {
    view.hidden = view.id !== `view-${name}`;
  }
}

function renderQuestion() {
  const q = state.questions[state.currentIndex];
  const root = document.getElementById('question');
  const selected = state.answers[q.id];
  root.innerHTML = `
    <h2>${escapeHTML(q.prompt)}</h2>
    <ul class="options">
      ${q.options.map(opt => `
        <li>
          <button class="option-btn" data-key="${opt.key}" aria-pressed="${selected === opt.key}">
            ${escapeHTML(opt.text)}
          </button>
        </li>
      `).join('')}
    </ul>
  `;
  for (const btn of root.querySelectorAll('.option-btn')) {
    btn.addEventListener('click', () => {
      state.answers[q.id] = btn.dataset.key;
      renderQuestion();
      updateNav();
    });
  }
  document.getElementById('progress').textContent = `${state.currentIndex + 1} / ${state.questions.length}`;
}

function updateNav() {
  const q = state.questions[state.currentIndex];
  document.getElementById('back-btn').disabled = state.currentIndex === 0;
  document.getElementById('next-btn').disabled = !state.answers[q.id];
  document.getElementById('next-btn').textContent =
    state.currentIndex === state.questions.length - 1 ? 'See my result' : 'Next';
}

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

async function init() {
  await loadContent();

  document.getElementById('start-btn').addEventListener('click', () => {
    setView('quiz');
    renderQuestion();
    updateNav();
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
      renderQuestion();
      updateNav();
    }
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    if (state.currentIndex < state.questions.length - 1) {
      state.currentIndex += 1;
      renderQuestion();
      updateNav();
    } else {
      finishQuiz();
    }
  });
}

function finishQuiz() {
  // Phase 1 stub: just show the answers as JSON. Real result renderer arrives in Phase 3.
  const root = document.getElementById('result-root');
  root.innerHTML = `
    <h1>Stub result page</h1>
    <p class="lede">Real result rendering arrives in Phase 3. For now, here are your raw answers:</p>
    <pre style="background:var(--bk-2);padding:18px;border:1px solid var(--line-2);overflow:auto;font-family:var(--font-mono);font-size:12.5px;">${JSON.stringify(state.answers, null, 2)}</pre>
  `;
  setView('result');
}

init();
```

- [ ] **Step 2: Reload and smoke-test the full quiz flow**

```bash
npm run dev
# open http://localhost:8080/ai-quiz/
```

Expected:
- Landing → click "Begin" → Q1 renders
- Each question shows 5 options; clicking one highlights it
- Next is disabled until an option is chosen
- Back works from Q2 onward
- After Q11, click "See my result" → stub result page shows the JSON of answers

- [ ] **Step 3: Commit**

```bash
git add ai-quiz/js/main.js
git commit -m "feat: implement quiz state machine and question rendering"
```

### Task 1.5: Phase 1 wrap

- [ ] **Step 1: Manual checklist**

- [ ] All 11 questions render in order
- [ ] Each shows 5 options
- [ ] Selection persists when navigating Back then forward
- [ ] Mobile-responsive at 375px width (basic check via DevTools)

- [ ] **Step 2: Commit any tweaks; tag Phase 1 complete**

```bash
git tag phase-1-tracer-bullet
```

---

# Phase 2 — Scoring Engine (TDD)

**Goal:** Pure, fully unit-tested scoring engine that takes 11 answers and returns `{ archetype, grade, dimensionGrades, monocultureFlag, driftFlag }`. Wire it into the result view.

### Task 2.1: Test setup

**Files:**
- Create: `tests/scoring.test.js`

- [ ] **Step 1: Write the first failing test — a coherent Pioneer respondent gets archetype Pioneer**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreQuiz } from '../ai-quiz/js/scoring.js';

test('coherent Pioneer answers produce primary archetype Pioneer', () => {
  const answers = {
    q1: 'pioneer', q2: 'pioneer', q3: 'pioneer', q4: 'pioneer',
    q5: 'pioneer', q6: 'pioneer', q7: 'pioneer', q8: 'pioneer',
    q9: 'pioneer', q10: 'pioneer', q11: 'imago_pioneer',
  };
  const result = scoreQuiz(answers);
  assert.equal(result.archetype, 'pioneer');
});
```

- [ ] **Step 2: Run it; expect failure**

```bash
npm test
```

Expected: `Cannot find module '../ai-quiz/js/scoring.js'` — confirms test runs and fails for the right reason.

### Task 2.2: Minimal scoring implementation

**Files:**
- Create: `ai-quiz/js/scoring.js`

- [ ] **Step 1: Write minimal `scoreQuiz` to pass the first test**

```js
export const ARCHETYPES = ['watchman', 'steward', 'builder', 'pioneer', 'preservationist'];
export const DIMENSIONS = ['theological_clarity', 'pastoral_integrity', 'operational_alignment', 'cultural_discernment', 'discipleship_formation'];

const QUESTION_TO_DIMENSION = {
  q1: 'theological_clarity', q2: 'theological_clarity',
  q3: 'pastoral_integrity',  q4: 'pastoral_integrity',
  q5: 'operational_alignment', q6: 'operational_alignment',
  q7: 'cultural_discernment', q8: 'cultural_discernment',
  q9: 'discipleship_formation', q10: 'discipleship_formation',
};

export function scoreQuiz(answers) {
  const dimensionAnswers = pluck(answers, Object.keys(QUESTION_TO_DIMENSION));
  const archetype = primaryArchetype(dimensionAnswers, answers);
  return { archetype };
}

function pluck(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

function primaryArchetype(dimensionAnswers, allAnswers) {
  const counts = Object.fromEntries(ARCHETYPES.map(a => [a, 0]));
  for (const v of Object.values(dimensionAnswers)) {
    if (counts[v] !== undefined) counts[v] += 1;
  }
  const max = Math.max(...Object.values(counts));
  const winners = ARCHETYPES.filter(a => counts[a] === max);
  if (winners.length === 1) return winners[0];
  // Tie-break 1: Q1
  if (winners.includes(allAnswers.q1)) return allAnswers.q1;
  // Tie-break 2: Q11 archetype tilt
  const q11Tilt = { imago_pioneer: 'pioneer', imago_e: 'preservationist' };
  if (q11Tilt[allAnswers.q11] && winners.includes(q11Tilt[allAnswers.q11])) {
    return q11Tilt[allAnswers.q11];
  }
  // Deterministic fallback: alphabetical
  return [...winners].sort()[0];
}
```

- [ ] **Step 2: Run; expect pass**

```bash
npm test
```

Expected: 1 pass.

- [ ] **Step 3: Commit**

```bash
git add ai-quiz/js/scoring.js tests/scoring.test.js
git commit -m "feat: minimal scoring engine — primary archetype assignment"
```

### Task 2.3: Coherence and grade computation (TDD)

- [ ] **Step 1: Add failing tests for coherence, breadth, and grade**

Append to `tests/scoring.test.js`:

```js
test('coherent Pioneer (10/10 + drift) caps at B with drift flag', () => {
  const answers = {
    q1: 'pioneer', q2: 'pioneer', q3: 'pioneer', q4: 'pioneer',
    q5: 'pioneer', q6: 'pioneer', q7: 'pioneer', q8: 'pioneer',
    q9: 'pioneer', q10: 'pioneer', q11: 'drift',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.archetype, 'pioneer');
  assert.equal(r.driftFlag, true);
  assert.equal(r.grade, 'B');
});

test('mixed mature Watchman (7 watchman + 2 steward + 1 preservationist) gets A', () => {
  const answers = {
    q1: 'watchman', q2: 'watchman', q3: 'watchman', q4: 'watchman',
    q5: 'steward',  q6: 'steward',  q7: 'watchman', q8: 'watchman',
    q9: 'watchman', q10: 'preservationist', q11: 'imago_a',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.archetype, 'watchman');
  assert.equal(r.grade, 'A');
  assert.equal(r.monocultureFlag, false);
  assert.equal(r.driftFlag, false);
});

test('monoculture Watchman (10/10) caps at B', () => {
  const answers = {
    q1: 'watchman', q2: 'watchman', q3: 'watchman', q4: 'watchman',
    q5: 'watchman', q6: 'watchman', q7: 'watchman', q8: 'watchman',
    q9: 'watchman', q10: 'watchman', q11: 'imago_a',
  };
  const r = scoreQuiz(answers);
  assert.equal(r.grade, 'B');
  assert.equal(r.monocultureFlag, true);
});

test('scattered answers (no clear primary) grade D or F', () => {
  const answers = {
    q1: 'watchman', q2: 'steward', q3: 'builder', q4: 'pioneer',
    q5: 'preservationist', q6: 'watchman', q7: 'steward', q8: 'builder',
    q9: 'pioneer', q10: 'preservationist', q11: 'imago_b',
  };
  const r = scoreQuiz(answers);
  assert.ok(['D', 'F'].includes(r.grade), `expected D or F, got ${r.grade}`);
});
```

- [ ] **Step 2: Run; expect failures**

```bash
npm test
```

- [ ] **Step 3: Extend `scoring.js` to compute coherence, breadth, modifiers, and grade**

Replace the body of `scoreQuiz` and add helpers:

```js
export function scoreQuiz(answers) {
  const dimensionAnswers = pluck(answers, Object.keys(QUESTION_TO_DIMENSION));
  const archetype = primaryArchetype(dimensionAnswers, answers);
  const coherence = computeCoherence(dimensionAnswers, archetype);
  const dimensionBreadth = computeBreadth(dimensionAnswers, archetype);
  const monocultureFlag = coherence >= 0.9;
  const driftFlag = answers.q11 === 'drift';
  const grade = computeGrade({ coherence, dimensionBreadth, monocultureFlag, driftFlag, archetype });
  const dimensionGrades = computeDimensionGrades(dimensionAnswers, archetype);
  return { archetype, coherence, dimensionBreadth, monocultureFlag, driftFlag, grade, dimensionGrades };
}

function computeCoherence(dimensionAnswers, primary) {
  const matches = Object.values(dimensionAnswers).filter(v => v === primary).length;
  return matches / Object.keys(dimensionAnswers).length;
}

function computeBreadth(dimensionAnswers, primary) {
  const hitDimensions = new Set();
  for (const [qid, answer] of Object.entries(dimensionAnswers)) {
    if (answer === primary) hitDimensions.add(QUESTION_TO_DIMENSION[qid]);
  }
  return hitDimensions.size / DIMENSIONS.length;
}

function computeGrade({ coherence, dimensionBreadth, monocultureFlag, driftFlag, archetype }) {
  if (coherence < 0.3) return 'F';
  if (coherence < 0.5) return 'D';
  if (monocultureFlag) return 'B';
  if (driftFlag && archetype === 'pioneer') return 'B';
  if (coherence >= 0.7 && dimensionBreadth >= 0.8) return driftFlag ? 'B' : 'A';
  if (coherence >= 0.5 && dimensionBreadth >= 0.6) return driftFlag ? 'C' : 'B';
  if (driftFlag) return 'C';
  return 'C';
}

function computeDimensionGrades(dimensionAnswers, primary) {
  const out = {};
  for (const dim of DIMENSIONS) {
    const questionsInDim = Object.entries(dimensionAnswers).filter(([qid]) => QUESTION_TO_DIMENSION[qid] === dim);
    const matches = questionsInDim.filter(([, v]) => v === primary).length;
    if (matches === 2) out[dim] = 'A';
    else if (matches === 1) out[dim] = 'B';
    else {
      const nonPrimary = questionsInDim.map(([, v]) => v);
      out[dim] = (nonPrimary[0] === nonPrimary[1]) ? 'C' : 'D';
    }
  }
  return out;
}
```

- [ ] **Step 4: Run; all tests pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add ai-quiz/js/scoring.js tests/scoring.test.js
git commit -m "feat: complete scoring engine — coherence, breadth, grade lookup, dimension sub-grades"
```

### Task 2.4: Wire scoring into the result view

- [ ] **Step 1: Update `finishQuiz` in `ai-quiz/js/main.js`**

Replace the stub `finishQuiz` body with:

```js
import { scoreQuiz } from './scoring.js';
// ...
function finishQuiz() {
  const result = scoreQuiz(state.answers);
  const root = document.getElementById('result-root');
  root.innerHTML = `
    <p class="eyebrow">Your result</p>
    <h1>${capitalize(result.archetype)}</h1>
    <p class="grade-tag">Grade: ${result.grade}</p>
    <p class="lede">(Personalized copy assembles in Phase 3.)</p>
    <pre style="background:var(--bk-2);padding:18px;border:1px solid var(--line-2);overflow:auto;font-family:var(--font-mono);font-size:12.5px;">${JSON.stringify(result, null, 2)}</pre>
  `;
  setView('result');
}
function capitalize(s) { return s[0].toUpperCase() + s.slice(1); }
```

Add the `import` at the top of `main.js`.

- [ ] **Step 2: Smoke-test in browser**

Take the quiz with a consistent Pioneer pattern + drift, verify result shows `pioneer` with grade `B`.

- [ ] **Step 3: Commit**

```bash
git add ai-quiz/js/main.js
git commit -m "feat: wire scoring engine into result view"
```

### Task 2.5: Phase 2 wrap

- [ ] All 4 scoring tests pass
- [ ] In-browser quiz produces correct archetype + grade for at least 3 hand-tested answer patterns
- [ ] Tag: `git tag phase-2-scoring`

---

# Phase 3 — Copy Production & Result Page Assembly

**Goal:** Real result page with personalized narrative, 5-dimension report card, drift caveat (when triggered), share row, "what's next" block, and skeleton email-capture block.

**Note on copy:** This phase produces *initial* copy stubs that mark all 25 grade-deltas with a `[NEEDS_VOICE_REVIEW]` tag in each block. Mitch will redline these in his voice before Phase 6 launch.

### Task 3.1: Author the archetype shells + grade-deltas

**Files:**
- Create: `ai-quiz/content/archetypes.json`
- Create: `ai-quiz/content/drift-caveats.json`

- [ ] **Step 1: Create `ai-quiz/content/archetypes.json`**

Structure (one object per archetype):

```json
{
  "version": 1,
  "archetypes": {
    "watchman": {
      "label": "Watchman",
      "tagline": "[NEEDS_VOICE_REVIEW] You see AI as spiritually significant and stand guard for your people.",
      "shell": "[NEEDS_VOICE_REVIEW] A Watchman holds the church's spiritual attentiveness in a high-tech age. You sense that AI is not just a tool but a cultural and theological event — and you refuse to treat it as ordinary. Your task is to keep the flock anchored when others are reactive, distracted, or naive.",
      "gradeDeltas": {
        "A": "[NEEDS_VOICE_REVIEW] You've thought this through. Your discernment isn't fear — it's formation. You can articulate why and your people are catechized accordingly.",
        "B": "[NEEDS_VOICE_REVIEW] Solid posture, but a gap somewhere — either policy, formation, or breadth across dimensions. The next step is operational.",
        "C": "[NEEDS_VOICE_REVIEW] Your instincts are right but the picture is mixed. Decide what you actually believe and write it down.",
        "D": "[NEEDS_VOICE_REVIEW] You sense the stakes but haven't built a coherent response. Watchmen without a plan become alarmists.",
        "F": "[NEEDS_VOICE_REVIEW] Concerned but unmoored — your answers don't yet form a position. Start with one careful conversation, not ten."
      },
      "whatsNext": {
        "practice": "[NEEDS_VOICE_REVIEW] Lead one quarterly congregational conversation on AI, attention, and discipleship.",
        "reading": "[NEEDS_VOICE_REVIEW] Read C.S. Lewis, *That Hideous Strength* — the most prescient Christian novel on the spiritual stakes of technocracy.",
        "tool": "[NEEDS_VOICE_REVIEW] You're a Watchman — your tool isn't an AI prompt. Try a 30-day fast from AI assistants and journal what changes."
      }
    },
    "steward": {
      "label": "Steward",
      "tagline": "[NEEDS_VOICE_REVIEW] You treat AI as a powerful tool that demands written wisdom.",
      "shell": "[NEEDS_VOICE_REVIEW] A Steward takes AI seriously without being captured by it. You believe the right answer comes from theological clarity plus practical policy — and you build the bridge between the two for your people.",
      "gradeDeltas": {
        "A": "[NEEDS_VOICE_REVIEW] You've done the work most churches will avoid for another two years. Theology and policy are both in writing, and they cohere.",
        "B": "[NEEDS_VOICE_REVIEW] Strong instincts, partial execution. Either the policy is written but not lived, or the formation is solid but the policy is missing.",
        "C": "[NEEDS_VOICE_REVIEW] You're carrying the burden of wisdom but you haven't shared it with your staff or congregation yet.",
        "D": "[NEEDS_VOICE_REVIEW] You want to be a Steward but you've outsourced the question. Stewards write things down.",
        "F": "[NEEDS_VOICE_REVIEW] The steward posture without the steward's work. Start with one written paragraph: what AI is for in your church, and what it isn't."
      },
      "whatsNext": {
        "practice": "[NEEDS_VOICE_REVIEW] Draft a one-page AI policy this quarter. Share it with your elder board for redline.",
        "reading": "[NEEDS_VOICE_REVIEW] Andy Crouch, *The Life We're Looking For* — the clearest Christian articulation of personhood vs. machine.",
        "tool": "[NEEDS_VOICE_REVIEW] Try our 'AI Policy Drafting' prompt — built specifically for ministry contexts."
      }
    },
    "builder": {
      "label": "Builder",
      "tagline": "[NEEDS_VOICE_REVIEW] You use AI to multiply ministry capacity while keeping humans in the seat that matters.",
      "shell": "[NEEDS_VOICE_REVIEW] A Builder treats AI as a tool — not a peer, not a threat. You're already integrating it into operations, but the integrity of the work depends on knowing which jobs only humans can do and refusing to outsource those.",
      "gradeDeltas": {
        "A": "[NEEDS_VOICE_REVIEW] Tools where they belong, humans where they belong. Your church is faster *and* more pastoral than it was three years ago.",
        "B": "[NEEDS_VOICE_REVIEW] Strong adoption but a gap on either disclosure or formation. Builders earn trust through transparency.",
        "C": "[NEEDS_VOICE_REVIEW] You're getting capacity but haven't been intentional about cost. Audit what's gone hollow.",
        "D": "[NEEDS_VOICE_REVIEW] Adoption without guardrails — the failure mode of Builders. Pause; write one rule about what AI never touches.",
        "F": "[NEEDS_VOICE_REVIEW] You like the energy of the AI conversation more than you've actually used it in your church. Start small and disclose loudly."
      },
      "whatsNext": {
        "practice": "[NEEDS_VOICE_REVIEW] Identify one ministry task AI should never touch in your church. Write it down. Tell your staff.",
        "reading": "[NEEDS_VOICE_REVIEW] Carey Nieuwhof, *AI and the Future Church* — the practical builder's manual for the next 3 years.",
        "tool": "[NEEDS_VOICE_REVIEW] Try our 'AI Disclosure Statement' prompt — a template for congregational transparency."
      }
    },
    "pioneer": {
      "label": "Pioneer",
      "tagline": "[NEEDS_VOICE_REVIEW] You see AI as gift for accelerating the Great Commission — while holding imago Dei firm.",
      "shell": "[NEEDS_VOICE_REVIEW] A Pioneer believes AI can serve the kingdom in ways the church hasn't imagined yet — translation, accessibility, formation at scale — without ever conceding that AI itself is anything more than a tool in human hands. Your theological clarity is what keeps your acceleration faithful.",
      "gradeDeltas": {
        "A": "[NEEDS_VOICE_REVIEW] You see what AI can do for the kingdom *and* you've held imago Dei firm. The rare both-and.",
        "B": "[NEEDS_VOICE_REVIEW] Bold vision, but either a worldview-drift caveat triggered or your operational base hasn't caught up to your imagination.",
        "C": "[NEEDS_VOICE_REVIEW] More excitement than infrastructure. Pioneers without operational alignment burn through trust quickly.",
        "D": "[NEEDS_VOICE_REVIEW] You like the Pioneer label but the answers don't match the posture. Decide what you're actually building.",
        "F": "[NEEDS_VOICE_REVIEW] Pioneers ship. If your church hasn't shipped a single AI-powered kingdom artifact, you're not pioneering — you're aspiring."
      },
      "whatsNext": {
        "practice": "[NEEDS_VOICE_REVIEW] Pick one Great Commission outcome AI could meaningfully accelerate this year. Build a 90-day plan.",
        "reading": "[NEEDS_VOICE_REVIEW] Pat Gelsinger's writing on Flourishing AI + Lyndon Drake's Oxford theology-and-AI work.",
        "tool": "[NEEDS_VOICE_REVIEW] Try our 'Kingdom AI Roadmap' prompt — built for Pioneers who want disciplined acceleration."
      }
    },
    "preservationist": {
      "label": "Preservationist",
      "tagline": "[NEEDS_VOICE_REVIEW] You build a community formed by embodied, pre-digital practice — and that's the point.",
      "shell": "[NEEDS_VOICE_REVIEW] A Preservationist isn't behind. You've chosen — coherently, theologically, communally — to form your church through the depths the AI conversation tends to skip. You bear witness to a different way of being church in a high-tech age.",
      "gradeDeltas": {
        "A": "[NEEDS_VOICE_REVIEW] Disciplined non-engagement. Your people are formed by Sabbath, conversation, books, embodied life. The broader church needs your witness.",
        "B": "[NEEDS_VOICE_REVIEW] Strong commitment but somewhere you've outsourced what you should be embodying. Find the gap.",
        "C": "[NEEDS_VOICE_REVIEW] The Preservationist label, but the practice is mixed — staff or families are using AI in ways your stated theology doesn't account for.",
        "D": "[NEEDS_VOICE_REVIEW] You say you don't engage with AI but you haven't named or chosen that position. You're not Amish — you're drifting.",
        "F": "[NEEDS_VOICE_REVIEW] Disengagement without discipline. Start with one practice: a screen-free dinner table, a paper-Bible reading group, a Sabbath rhythm."
      },
      "whatsNext": {
        "practice": "[NEEDS_VOICE_REVIEW] Name and write one non-engagement practice you'll teach this year. Communal, embodied, communicable.",
        "reading": "[NEEDS_VOICE_REVIEW] Wendell Berry, *The Unsettling of America* — and Jacques Ellul, *The Technological Society*.",
        "tool": "[NEEDS_VOICE_REVIEW] You're a Preservationist — your tool is a book list, not a prompt. Ask Disciple AI for a curated reading list per topic."
      }
    }
  }
}
```

- [ ] **Step 2: Create `ai-quiz/content/drift-caveats.json`**

```json
{
  "version": 1,
  "caveats": {
    "pioneer_drift": "[NEEDS_VOICE_REVIEW] Your answer to the final question suggests you may be drifting into worthy-successor territory — the idea that AI may eventually have moral status of its own. This is a real and increasingly common drift inside Pioneer Christianity, and it's a theological failure mode, not a feature of kingdom optimism. Imago Dei is not a stewardship category; it's an ontological one. Read Andy Crouch, Wendell Berry, and C.S. Lewis. We've capped your grade at B not to punish you but to flag this — Pioneers who don't hold imago Dei firm become something else.",
    "general_drift": "[NEEDS_VOICE_REVIEW] One of your answers signals openness to taking AI's moral status seriously as it grows more capable. We flag this gently for any archetype — this is the largest theological drift risk on the AI horizon for Christians."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add ai-quiz/content/archetypes.json ai-quiz/content/drift-caveats.json
git commit -m "feat: add archetype shells + grade-deltas + drift caveats (voice-review stubs)"
```

### Task 3.2: Content loader with tests

**Files:**
- Create: `ai-quiz/js/content-loader.js`
- Create: `tests/content-loader.test.js`

- [ ] **Step 1: Write failing test**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assembleResultCopy } from '../ai-quiz/js/content-loader.js';
import { readFileSync } from 'node:fs';

const archetypes = JSON.parse(readFileSync(new URL('../ai-quiz/content/archetypes.json', import.meta.url)));
const drift = JSON.parse(readFileSync(new URL('../ai-quiz/content/drift-caveats.json', import.meta.url)));

test('assembleResultCopy returns shell, grade-delta, and no caveat for clean Pioneer A', () => {
  const result = { archetype: 'pioneer', grade: 'A', driftFlag: false };
  const copy = assembleResultCopy(result, archetypes, drift);
  assert.match(copy.shell, /Pioneer/);
  assert.match(copy.gradeDelta, /both-and/);
  assert.equal(copy.driftCaveat, null);
});

test('Pioneer with drift gets pioneer_drift caveat', () => {
  const result = { archetype: 'pioneer', grade: 'B', driftFlag: true };
  const copy = assembleResultCopy(result, archetypes, drift);
  assert.match(copy.driftCaveat, /worthy-successor/);
});

test('Non-Pioneer with drift gets general_drift caveat', () => {
  const result = { archetype: 'watchman', grade: 'A', driftFlag: true };
  const copy = assembleResultCopy(result, archetypes, drift);
  assert.match(copy.driftCaveat, /openness to taking AI's moral status/);
});
```

- [ ] **Step 2: Run; expect failure**

```bash
npm test
```

- [ ] **Step 3: Implement `assembleResultCopy`**

```js
// ai-quiz/js/content-loader.js

export function assembleResultCopy(result, archetypesData, driftData) {
  const archetype = archetypesData.archetypes[result.archetype];
  if (!archetype) throw new Error(`unknown archetype: ${result.archetype}`);
  const gradeDelta = archetype.gradeDeltas[result.grade];
  if (!gradeDelta) throw new Error(`unknown grade: ${result.grade}`);

  let driftCaveat = null;
  if (result.driftFlag) {
    driftCaveat = result.archetype === 'pioneer'
      ? driftData.caveats.pioneer_drift
      : driftData.caveats.general_drift;
  }

  return {
    label: archetype.label,
    tagline: archetype.tagline,
    shell: archetype.shell,
    gradeDelta,
    driftCaveat,
    whatsNext: archetype.whatsNext,
  };
}

export async function loadContent() {
  const [archetypesRes, driftRes] = await Promise.all([
    fetch('./content/archetypes.json'),
    fetch('./content/drift-caveats.json'),
  ]);
  return {
    archetypes: await archetypesRes.json(),
    drift: await driftRes.json(),
  };
}
```

- [ ] **Step 4: Run; tests pass**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add ai-quiz/js/content-loader.js tests/content-loader.test.js
git commit -m "feat: content loader assembles result copy from archetype + grade + drift"
```

### Task 3.3: Real result-page rendering

- [ ] **Step 1: Update `ai-quiz/js/main.js` to render the full result page**

Add at the top of `main.js`:

```js
import { scoreQuiz } from './scoring.js';
import { assembleResultCopy, loadContent as loadResultContent } from './content-loader.js';

let resultContent = null;
```

Update `init` to preload result content alongside questions:

```js
async function init() {
  await Promise.all([loadContent(), preloadResultContent()]);
  // ... existing listener wiring
}

async function preloadResultContent() {
  resultContent = await loadResultContent();
}
```

Replace `finishQuiz` with full renderer:

```js
function finishQuiz() {
  const result = scoreQuiz(state.answers);
  const copy = assembleResultCopy(result, resultContent.archetypes, resultContent.drift);
  const root = document.getElementById('result-root');
  root.innerHTML = renderResultHTML(result, copy);
  setView('result');
  window.scrollTo(0, 0);
}

function renderResultHTML(result, copy) {
  const dimensionRows = Object.entries(result.dimensionGrades).map(([dim, g]) => `
    <li class="dim-row">
      <span class="dim-name">${dimensionLabel(dim)}</span>
      <span class="dim-grade">${g}</span>
    </li>
  `).join('');

  return `
    <p class="eyebrow">Your result</p>
    <h1 class="result-name">${escapeHTML(copy.label)}</h1>
    <p class="result-grade">Grade <strong>${result.grade}</strong></p>
    <p class="result-tagline">${escapeHTML(copy.tagline)}</p>

    <section class="narrative">
      <p>${escapeHTML(copy.shell)}</p>
      <p>${escapeHTML(copy.gradeDelta)}</p>
    </section>

    ${copy.driftCaveat ? `<aside class="drift-caveat"><h3>A note on your final answer</h3><p>${escapeHTML(copy.driftCaveat)}</p></aside>` : ''}

    <section class="report-card">
      <h3>Your breakdown</h3>
      <ul class="dim-list">${dimensionRows}</ul>
    </section>

    <section class="whats-next">
      <h3>What's next</h3>
      <p><strong>Practice:</strong> ${escapeHTML(copy.whatsNext.practice)}</p>
      <p><strong>Read:</strong> ${escapeHTML(copy.whatsNext.reading)}</p>
      <p><strong>Tool or absence:</strong> ${escapeHTML(copy.whatsNext.tool)}</p>
    </section>

    <section id="email-capture" class="email-capture">
      <p class="lede">(Email capture renders in Phase 5.)</p>
    </section>
  `;
}

function dimensionLabel(key) {
  return {
    theological_clarity: 'Theological Clarity',
    pastoral_integrity:  'Pastoral Integrity',
    operational_alignment: 'Operational Alignment',
    cultural_discernment: 'Cultural Discernment',
    discipleship_formation: 'Discipleship Formation',
  }[key] || key;
}
```

- [ ] **Step 2: Add result-page styles to `quiz.css`**

```css
.result-name { font-family: var(--font-serif); font-size: clamp(3rem, 8vw, 5.5rem); margin: 0 0 8px; line-height: 1; }
.result-grade { font-family: var(--font-mono); font-size: 18px; color: var(--gilt); letter-spacing: .12em; margin: 0 0 28px; }
.result-grade strong { font-size: 36px; color: var(--paper); }
.result-tagline { font-size: 19px; color: var(--paper-dim); margin: 0 0 32px; }
.narrative p { font-size: 17px; line-height: 1.55; margin: 0 0 16px; }

.drift-caveat { background: var(--bk-2); border-left: 3px solid var(--ox); padding: 20px 24px; margin: 24px 0; border-radius: 2px; }
.drift-caveat h3 { font-family: var(--font-mono); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--ox); margin: 0 0 12px; }

.report-card { margin: 40px 0; padding: 24px; background: var(--bk-2); border: 1px solid var(--line-2); border-radius: 4px; }
.report-card h3 { font-family: var(--font-mono); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--paper-mute); margin: 0 0 16px; }
.dim-list { list-style: none; padding: 0; margin: 0; }
.dim-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--line); font-family: var(--font-serif); font-size: 16px; }
.dim-grade { font-family: var(--font-mono); font-weight: 600; color: var(--gilt); }

.whats-next { margin: 32px 0; }
.whats-next p { margin: 0 0 10px; font-size: 16px; }
```

- [ ] **Step 3: Smoke-test**

Take the quiz multiple times with different patterns. Verify:
- Each archetype shell renders
- Grade displays correctly
- Drift caveat appears only when Q11 = drift
- Pioneer + drift shows the `pioneer_drift` caveat; non-Pioneer + drift shows `general_drift`

- [ ] **Step 4: Commit**

```bash
git add ai-quiz/js/main.js ai-quiz/quiz.css
git commit -m "feat: render real result page with archetype, grade, breakdown, drift caveat, whats-next"
```

### Task 3.4: Phase 3 wrap

- [ ] All 25 grade-delta blocks render correctly
- [ ] Tag: `git tag phase-3-copy-stub`
- [ ] **PushNotification: copy is now in `[NEEDS_VOICE_REVIEW]` state — needs Mitch's voice pass before Phase 6 deploy**

---

# Phase 4 — Data Persistence (Supabase)

**Blocking dependency:** Mitch supplies `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`. PushNotification user when reaching this phase if values are unset.

### Task 4.1: Schema migration

**Files:**
- Create: `supabase/migrations/001_quiz_schema.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 001_quiz_schema.sql
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  responses jsonb not null,
  computed jsonb not null,
  email text,
  name text,
  role text,
  is_arizona boolean,
  interview_opt_in boolean,
  group_version_opt_in boolean,
  kit_opt_in boolean,
  consent_to_outreach boolean not null default false,
  referrer text,
  user_agent_hash text
);

create index if not exists submissions_archetype_idx on submissions ((computed->>'primary_archetype'));
create index if not exists submissions_grade_idx on submissions ((computed->>'grade'));
create index if not exists submissions_created_at_idx on submissions (created_at desc);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  event_type text not null,
  created_at timestamptz not null default now(),
  metadata jsonb
);

create index if not exists events_session_idx on events (session_id);
create index if not exists events_type_idx on events (event_type, created_at desc);
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

```
Use mcp__4714677e-c198-465a-855f-71b4f017f998__apply_migration with the SQL above.
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_quiz_schema.sql
git commit -m "feat: supabase schema for submissions and events"
```

### Task 4.2: Serverless submission endpoint

**Files:**
- Create: `api/submit-quiz.js`

- [ ] **Step 1: Implement the endpoint**

```js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  try {
    const { sessionId, responses, computed, email, name, role, isArizona,
            interviewOptIn, groupVersionOptIn, kitOptIn, referrer } = req.body;

    if (!sessionId || !responses || !computed) {
      res.status(400).json({ error: 'missing required fields' });
      return;
    }

    const { data, error } = await supabase.from('submissions').insert({
      session_id: sessionId,
      responses,
      computed,
      email: email || null,
      name: name || null,
      role: role || null,
      is_arizona: isArizona ?? null,
      interview_opt_in: interviewOptIn ?? null,
      group_version_opt_in: groupVersionOptIn ?? null,
      kit_opt_in: kitOptIn ?? null,
      consent_to_outreach: !!email,
      referrer: referrer || null,
    }).select().single();

    if (error) throw error;
    res.status(200).json({ id: data.id, calendlyUrl: process.env.CALENDLY_URL || null });
  } catch (err) {
    console.error('submit-quiz error', err);
    res.status(500).json({ error: 'submission failed' });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add api/submit-quiz.js
git commit -m "feat: serverless submit-quiz endpoint persists to supabase"
```

### Task 4.3: Frontend submit module

**Files:**
- Create: `ai-quiz/js/submit.js`

- [ ] **Step 1: Implement**

```js
export async function submitQuiz(payload) {
  const res = await fetch('/api/submit-quiz', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`submit failed: ${res.status}`);
  return res.json();
}

export function getSessionId() {
  const key = 'disciple-ai-quiz-session';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
```

- [ ] **Step 2: Wire into `finishQuiz`**

Update `finishQuiz` in `main.js` to call `submitQuiz` right after scoring. Store the returned `calendlyUrl` on `state` for use in Phase 5.

- [ ] **Step 3: Commit**

```bash
git add ai-quiz/js/submit.js ai-quiz/js/main.js
git commit -m "feat: frontend submits computed result to backend on quiz finish"
```

### Task 4.4: Phase 4 wrap

- [ ] Submission appears in `submissions` table when quiz is completed locally
- [ ] Tag: `git tag phase-4-persistence`

---

# Phase 5 — Email Capture, Privacy Consent, Kit & Calendly

**Blocking dependency:** Mitch supplies `KIT_API_KEY` and `CALENDLY_URL`. Without them, Phase 5 can build the UI and stub the network calls — but actual Kit/Calendly behavior won't work until credentials arrive.

### Task 5.1: Email capture UI

- [ ] **Step 1: Replace the email-capture stub in `renderResultHTML`**

```html
<section id="email-capture" class="email-capture">
  <h3>Willing to talk about this further?</h3>
  <p>Disciple AI is publishing a Substack newsletter that surfaces the smartest thinking from pastors and ministry leaders on AI and the church. I'd love to interview you for 15–30 minutes about your position. <strong>If you're in Arizona — coffee's on me.</strong></p>

  <div class="privacy-block">
    <p><strong>What we'll do with your information:</strong> We use it to reach out to you about this conversation — nothing else. We will <strong>never</strong> publish, quote, or attribute your quiz responses or anything you share without your explicit, written permission. If you choose to be featured later, that's a separate conversation we'll have with you directly.</p>
  </div>

  <form id="capture-form">
    <label>Email <input name="email" type="email" required></label>
    <label>Name <input name="name" type="text" required></label>
    <label>Role
      <select name="role">
        <option value="">(optional)</option>
        <option value="pastor">Pastor</option>
        <option value="ministry_leader">Ministry leader</option>
        <option value="writer">Writer</option>
        <option value="theologian">Theologian</option>
        <option value="other">Other</option>
      </select>
    </label>
    <label class="inline"><input type="checkbox" name="is_arizona"> I'm in Arizona</label>

    <fieldset class="opt-ins">
      <label class="inline"><input type="checkbox" name="interview_opt_in"> <strong>Yes, willing to talk further</strong> (15–30 min interview)</label>
      <label class="inline"><input type="checkbox" name="group_version_opt_in"> <strong>Notify me when the group/congregation version is ready</strong></label>
      <label class="inline"><input type="checkbox" name="kit_opt_in"> Add me to the Kit list (personal-outreach + per-archetype emails; separate from the Substack newsletter)</label>
    </fieldset>

    <button class="btn-p" type="submit">Submit</button>
  </form>
  <div id="capture-success" hidden></div>
</section>
```

- [ ] **Step 2: Wire form handler**

```js
function wireEmailCapture(submissionId) {
  const form = document.getElementById('capture-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {
      submissionId,
      email: data.get('email'),
      name: data.get('name'),
      role: data.get('role') || null,
      isArizona: data.get('is_arizona') === 'on',
      interviewOptIn: data.get('interview_opt_in') === 'on',
      groupVersionOptIn: data.get('group_version_opt_in') === 'on',
      kitOptIn: data.get('kit_opt_in') === 'on',
    };
    const result = await fetch('/api/save-contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());

    showCaptureSuccess(result, payload);
  });
}

function showCaptureSuccess({ calendlyUrl }, payload) {
  document.getElementById('capture-form').hidden = true;
  const root = document.getElementById('capture-success');
  root.hidden = false;
  root.innerHTML = payload.interviewOptIn && calendlyUrl
    ? `<h3>Thanks — let's get on the calendar.</h3><p><a class="btn-p" href="${calendlyUrl}" target="_blank" rel="noopener">Book a 15–30 min slot</a></p>`
    : `<h3>Thanks. I'll be in touch.</h3>`;
}
```

- [ ] **Step 3: Style the capture block (CSS)**

```css
.email-capture { margin: 40px 0; padding: 28px; background: var(--bk-2); border: 1px solid var(--line-2); border-radius: 4px; }
.email-capture h3 { font-family: var(--font-serif); font-size: 24px; margin: 0 0 12px; }
.privacy-block { background: var(--bk-3); border-left: 3px solid var(--gilt); padding: 14px 16px; margin: 16px 0; font-size: 14px; line-height: 1.55; color: var(--paper-dim); }
#capture-form label { display: block; margin: 14px 0; font-family: var(--font-mono); font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: var(--paper-mute); }
#capture-form input[type="email"], #capture-form input[type="text"], #capture-form select { width: 100%; margin-top: 6px; padding: 12px; background: var(--bk); color: var(--paper); border: 1px solid var(--line-2); border-radius: 2px; font-family: var(--font-serif); font-size: 16px; }
#capture-form label.inline { display: flex; align-items: center; gap: 10px; font-family: var(--font-serif); font-size: 15px; text-transform: none; letter-spacing: 0; color: var(--paper); }
fieldset.opt-ins { border: 0; padding: 16px 0; margin: 12px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
```

- [ ] **Step 4: Commit**

```bash
git add ai-quiz/js/main.js ai-quiz/quiz.css
git commit -m "feat: email capture form with privacy-consent block and three opt-ins"
```

### Task 5.2: Backend save-contact endpoint with Kit integration

**Files:**
- Create: `api/save-contact.js`

- [ ] **Step 1: Implement**

```js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  try {
    const { submissionId, email, name, role, isArizona,
            interviewOptIn, groupVersionOptIn, kitOptIn } = req.body;

    if (!submissionId || !email) {
      res.status(400).json({ error: 'submissionId and email are required' });
      return;
    }

    const { error } = await supabase.from('submissions').update({
      email, name, role, is_arizona: isArizona,
      interview_opt_in: interviewOptIn,
      group_version_opt_in: groupVersionOptIn,
      kit_opt_in: kitOptIn,
      consent_to_outreach: true,
    }).eq('id', submissionId);

    if (error) throw error;

    if (kitOptIn || groupVersionOptIn || interviewOptIn) {
      await pushToKit({ email, name, role, interviewOptIn, groupVersionOptIn, kitOptIn });
    }

    res.status(200).json({ calendlyUrl: process.env.CALENDLY_URL || null });
  } catch (err) {
    console.error('save-contact error', err);
    res.status(500).json({ error: 'save failed' });
  }
}

async function pushToKit({ email, name, role, interviewOptIn, groupVersionOptIn, kitOptIn }) {
  if (!process.env.KIT_API_KEY) {
    console.warn('KIT_API_KEY unset — skipping Kit push');
    return;
  }
  const tags = [];
  if (interviewOptIn) tags.push('interview-prospect');
  if (groupVersionOptIn) tags.push('group-version-notify');
  if (kitOptIn) tags.push('quiz-subscriber');

  await fetch('https://api.kit.com/v4/subscribers', {
    method: 'POST',
    headers: {
      'X-Kit-Api-Key': process.env.KIT_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      first_name: name,
      fields: { role: role || '' },
      tags,
    }),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add api/save-contact.js
git commit -m "feat: save-contact endpoint updates submission and pushes to Kit"
```

### Task 5.3: Share row

**Files:**
- Create: `ai-quiz/js/share.js`

- [ ] **Step 1: Implement**

```js
export function buildShareLinks({ archetype, grade }) {
  const text = `I'm a ${archetype} (${grade}) on the Disciple AI Church Leadership Quiz. Take it: https://disciple.ai/ai-quiz`;
  return {
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://disciple.ai/ai-quiz')}`,
    copy: text,
  };
}
```

- [ ] **Step 2: Add share row to result page; commit**

### Task 5.4: Phase 5 wrap

- [ ] Capture form submits successfully end-to-end (mock Kit if API key unavailable)
- [ ] Interview opt-in shows Calendly link in success state
- [ ] Tag: `git tag phase-5-capture`

---

# Phase 6 — Polish, Analytics, Deploy

**Blocking dependency:** Vercel project access + target domain.

### Task 6.1: Analytics events

- [ ] **Step 1: Add event-logging function to `submit.js`**

```js
export async function logEvent(sessionId, eventType, metadata = {}) {
  try {
    await fetch('/api/log-event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, eventType, metadata }),
    });
  } catch (e) { /* fire-and-forget */ }
}
```

- [ ] **Step 2: Implement `api/log-event.js` writing to the `events` table**
- [ ] **Step 3: Instrument:**
  - `started` on landing → quiz transition
  - `completed` on result render
  - `email_given` on capture submit
  - `interview_yes` on interview opt-in checked + submitted
  - `share_clicked` on each share button
- [ ] **Step 4: Commit**

### Task 6.2: Mobile responsive QA

- [ ] **Step 1: Manually test at 375px, 768px, 1280px**
- [ ] **Step 2: Fix any layout breaks**
- [ ] **Step 3: Commit**

### Task 6.3: Accessibility pass

- [ ] **Step 1: Keyboard navigation through all 11 questions**
- [ ] **Step 2: ARIA labels on option buttons + form fields**
- [ ] **Step 3: Color contrast check (paper/bk meets WCAG AA — verify)**

### Task 6.4: Voice review of copy

- [ ] **Step 1: PushNotification Mitch: copy-redline session needed before deploy**
- [ ] **Step 2: Hand-edit each `[NEEDS_VOICE_REVIEW]` block in `archetypes.json` and `drift-caveats.json` with Mitch's voice**
- [ ] **Step 3: Commit voice-final copy**

### Task 6.5: Deploy

- [ ] **Step 1: PushNotification Mitch for Vercel project access**
- [ ] **Step 2: `vercel link` to existing project (or create new)**
- [ ] **Step 3: Set env vars in Vercel dashboard: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `KIT_API_KEY`, `CALENDLY_URL`**
- [ ] **Step 4: `vercel --prod`**
- [ ] **Step 5: Smoke test on production URL**

### Task 6.6: Launch checklist

- [ ] All 4 scoring tests pass in CI
- [ ] Quiz completes end-to-end on production with real email capture
- [ ] First test submission appears in Supabase
- [ ] Test submission tagged in Kit
- [ ] Interview opt-in delivers Calendly link
- [ ] Tag: `git tag v1.0-launch`
- [ ] PushNotification: shipped

---

## Open Items Tracked by Plan

These appear in plan tasks but require user action to clear:

1. **Calendly URL** — Phase 5 (Task 5.1 success state needs it; can deploy with stub until provided)
2. **Kit API key** — Phase 5 (Task 5.2 gracefully no-ops without it)
3. **Supabase project URL + service key** — Phase 4 (cannot persist without)
4. **Vercel project access + target domain** — Phase 6
5. **Voice review of 25 grade-deltas + 2 drift caveats** — Phase 6 (Task 6.4); all currently `[NEEDS_VOICE_REVIEW]`
