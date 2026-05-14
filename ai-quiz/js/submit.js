// Frontend submission helpers — talks to /api/submit-quiz, /api/save-contact, /api/log-event.

export async function submitQuiz({ sessionId, responses, computed }) {
  const res = await fetch('/api/submit-quiz', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      responses,
      computed,
      referrer: document.referrer || null,
    }),
  });
  if (!res.ok) throw new Error(`submit failed: ${res.status}`);
  return res.json();
}

export async function saveContact(payload) {
  const res = await fetch('/api/save-contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`save-contact failed: ${res.status}`);
  return res.json();
}

export function logEvent(sessionId, eventType, metadata) {
  // Fire-and-forget — never blocks the UI on analytics.
  fetch('/api/log-event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId, eventType, metadata }),
    keepalive: true,
  }).catch(() => { /* swallow */ });
}

export function getSessionId() {
  const key = 'disciple-ai-quiz-session';
  let id;
  try { id = localStorage.getItem(key); } catch { /* private mode */ }
  if (!id) {
    id = crypto.randomUUID();
    try { localStorage.setItem(key, id); } catch { /* ignore */ }
  }
  return id;
}
