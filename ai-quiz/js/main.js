import { scoreQuiz } from './scoring.js';
import { assembleResultCopy, loadResultContent } from './content-loader.js';
import { submitQuiz, saveContact, logEvent, getSessionId } from './submit.js';

const state = {
  questions: [],
  answers: {},
  currentIndex: 0,
  sessionId: null,
  submissionId: null,
  result: null,
};

let resultContent = null;

async function loadContent() {
  // Resolve relative to THIS module's URL so the fetch works whether the
  // document is served at /ai-quiz or /ai-quiz/ (trailing slash difference
  // would otherwise re-root the relative fetch to the wrong path).
  const url = new URL('../content/questions.json', import.meta.url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`questions.json ${res.status}`);
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

function dimensionLabel(key) {
  return {
    theological_clarity: 'Theological Clarity',
    pastoral_integrity:  'Pastoral Integrity',
    operational_alignment: 'Operational Alignment',
    cultural_discernment: 'Cultural Discernment',
    discipleship_formation: 'Discipleship Formation',
  }[key] || key;
}

async function init() {
  state.sessionId = getSessionId();
  await Promise.all([loadContent(), preloadResultContent()]);

  document.getElementById('start-btn').addEventListener('click', () => {
    logEvent(state.sessionId, 'started');
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

async function preloadResultContent() {
  resultContent = await loadResultContent();
}

async function finishQuiz() {
  const result = scoreQuiz(state.answers);
  state.result = result;
  const copy = assembleResultCopy(result, resultContent.archetypes, resultContent.drift);
  document.getElementById('result-root').innerHTML = renderResultHTML(result, copy);
  setView('result');
  window.scrollTo(0, 0);

  logEvent(state.sessionId, 'completed', { archetype: result.archetype, grade: result.grade });

  // Fire submission to backend. Don't block the result render on it.
  try {
    const { id, schedulingUrl } = await submitQuiz({
      sessionId: state.sessionId,
      responses: state.answers,
      computed: result,
    });
    state.submissionId = id;
    state.schedulingUrl = schedulingUrl;
    wireEmailCapture();
  } catch (err) {
    console.error('Quiz submission failed:', err);
    const block = document.getElementById('email-capture');
    if (block) {
      block.innerHTML = '<p class="lede">(We couldn\'t save your result, but you can still see it above. Feel free to share a screenshot.)</p>';
    }
  }
}

function renderResultHTML(result, copy) {
  const dimensionRows = Object.entries(result.dimensionGrades).map(([dim, g]) => `
    <li class="dim-row">
      <span class="dim-name">${escapeHTML(dimensionLabel(dim))}</span>
      <span class="dim-grade">${escapeHTML(g)}</span>
    </li>
  `).join('');

  return `
    <p class="eyebrow">Your result</p>
    <h1 class="result-name">${escapeHTML(copy.label)}</h1>
    <p class="result-grade">Grade <strong>${escapeHTML(result.grade)}</strong></p>
    <p class="result-tagline">${escapeHTML(copy.tagline)}</p>

    <section class="narrative">
      <p>${escapeHTML(copy.shell)}</p>
      <p>${escapeHTML(copy.gradeDelta)}</p>
    </section>

    ${copy.driftCaveat ? `
      <aside class="drift-caveat">
        <h3>A note on your final answer</h3>
        <p>${escapeHTML(copy.driftCaveat)}</p>
      </aside>
    ` : ''}

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
      <h3>Willing to talk about this further?</h3>
      <p>Disciple AI is publishing a Substack newsletter that surfaces the smartest thinking from pastors and ministry leaders on AI and the church. I'd love to interview you for 15&ndash;30 minutes about your position. <strong>If you're in Arizona &mdash; coffee's on me.</strong></p>

      <div class="privacy-block">
        <p><strong>What we'll do with your information:</strong> We use it to reach out to you about this conversation &mdash; nothing else. We will <strong>never</strong> publish, quote, or attribute your quiz responses or anything you share without your explicit, written permission. If you choose to be featured later, that's a separate conversation we'll have with you directly.</p>
      </div>

      <form id="capture-form">
        <label>Email <input name="email" type="email" required autocomplete="email"></label>
        <label>Name <input name="name" type="text" required autocomplete="name"></label>
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
        <label class="inline"><input type="checkbox" name="is_arizona"> <span>I'm in Arizona</span></label>

        <fieldset class="opt-ins">
          <label class="inline"><input type="checkbox" name="interview_opt_in"> <span><strong>Yes, willing to talk further</strong> (15&ndash;30 min interview)</span></label>
          <label class="inline"><input type="checkbox" name="group_version_opt_in"> <span><strong>Notify me when the group/congregation version is ready</strong></span></label>
          <label class="inline"><input type="checkbox" name="kit_opt_in"> <span>Add me to the Kit list (personal outreach + per-archetype emails; separate from the Substack newsletter)</span></label>
        </fieldset>

        <button class="btn-p" type="submit" id="capture-submit-btn">Submit</button>
        <p id="capture-error" class="capture-error" hidden></p>
      </form>
      <div id="capture-success" hidden></div>
    </section>
  `;
}

function wireEmailCapture() {
  const form = document.getElementById('capture-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('capture-submit-btn');
    const errorBox = document.getElementById('capture-error');
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    errorBox.hidden = true;

    const data = new FormData(form);
    const payload = {
      submissionId: state.submissionId,
      email: data.get('email'),
      name: data.get('name'),
      role: data.get('role') || null,
      isArizona: data.get('is_arizona') === 'on',
      interviewOptIn: data.get('interview_opt_in') === 'on',
      groupVersionOptIn: data.get('group_version_opt_in') === 'on',
      kitOptIn: data.get('kit_opt_in') === 'on',
    };

    try {
      const result = await saveContact(payload);
      logEvent(state.sessionId, 'email_given', {
        interview: payload.interviewOptIn,
        group: payload.groupVersionOptIn,
        kit: payload.kitOptIn,
      });
      if (payload.interviewOptIn) {
        logEvent(state.sessionId, 'interview_yes', { is_arizona: payload.isArizona });
      }
      showCaptureSuccess(result, payload);
    } catch (err) {
      console.error('save-contact failed:', err);
      errorBox.textContent = 'Something went wrong — please try again, or email mitch directly.';
      errorBox.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Submit';
    }
  });
}

function showCaptureSuccess(result, payload) {
  document.getElementById('capture-form').hidden = true;
  const root = document.getElementById('capture-success');
  root.hidden = false;
  const schedulingUrl = result.schedulingUrl || state.schedulingUrl;
  if (payload.interviewOptIn && schedulingUrl) {
    root.innerHTML = `
      <h3>Thanks — let's get on the calendar.</h3>
      <p>Pick a time that works:</p>
      <p><a class="btn-p" href="${schedulingUrl}" target="_blank" rel="noopener">Book a 15&ndash;30 min slot</a></p>
    `;
  } else {
    root.innerHTML = `<h3>Thanks. I'll be in touch.</h3>`;
  }
}

init();
