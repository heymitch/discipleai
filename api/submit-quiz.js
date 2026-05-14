// Vercel serverless function — persists a completed quiz to Supabase.
// Accepts: { sessionId, responses, computed, referrer? }
// Returns: { id, schedulingUrl }
//
// Uses PostgREST directly via fetch — no SDK dependency.
// Auth: publishable (anon) key + RLS policy 'quiz_submissions public insert'.
// UUID is generated server-side so we can use return=minimal (no SELECT policy needed).

import { randomUUID } from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SCHEDULING_URL = process.env.SCHEDULING_URL || null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('submit-quiz: Supabase env vars missing');
    res.status(500).json({ error: 'server misconfigured' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const { sessionId, responses, computed, referrer } = body;

    if (!sessionId || !responses || !computed) {
      res.status(400).json({ error: 'sessionId, responses, computed are required' });
      return;
    }

    const id = randomUUID();
    const payload = {
      id,
      session_id: sessionId,
      responses,
      computed,
      referrer: referrer || null,
      user_agent_hash: hashString(req.headers['user-agent'] || ''),
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_submissions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      console.error('submit-quiz supabase error', insertRes.status, text);
      res.status(502).json({ error: 'persistence failed' });
      return;
    }

    res.status(200).json({ id, schedulingUrl: SCHEDULING_URL });
  } catch (err) {
    console.error('submit-quiz unexpected error', err);
    res.status(500).json({ error: 'submission failed' });
  }
}

async function readJsonBody(req) {
  // Vercel auto-parses JSON when content-type is application/json.
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function hashString(s) {
  // Cheap non-crypto hash — only used to dedupe bots, not for security.
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return String(h);
}
