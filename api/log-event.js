// Vercel serverless function — fire-and-forget funnel event logging.
// Accepts: { sessionId, eventType, metadata? }
// Returns: 204 No Content on success.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(204).end(); // Soft-fail — don't block UX on analytics
    return;
  }

  try {
    const body = await readJsonBody(req);
    const { sessionId, eventType, metadata } = body;
    if (!sessionId || !eventType) {
      res.status(400).end();
      return;
    }

    await fetch(`${SUPABASE_URL}/rest/v1/quiz_events`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: eventType,
        metadata: metadata || null,
      }),
    });
    res.status(204).end();
  } catch (err) {
    console.error('log-event error', err);
    res.status(204).end(); // Soft-fail
  }
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
