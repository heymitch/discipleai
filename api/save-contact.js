// Vercel serverless function — saves a quiz contact (email + opt-ins).
// Linked to a prior quiz_submissions row by submissionId.
//
// Accepts: { submissionId, email, name, role?, isArizona?,
//            interviewOptIn?, groupVersionOptIn?, kitOptIn? }
// Returns: { id, schedulingUrl }
//
// Side effects:
//   - Inserts a quiz_contacts row
//   - If KIT_API_KEY set and any opt-in true, pushes subscriber to Kit with tags

import { randomUUID } from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SCHEDULING_URL = process.env.SCHEDULING_URL || null;
const KIT_API_KEY = process.env.KIT_API_KEY || null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(500).json({ error: 'server misconfigured' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const {
      submissionId, email, name, role,
      isArizona, interviewOptIn, groupVersionOptIn, kitOptIn,
    } = body;

    if (!submissionId || !email) {
      res.status(400).json({ error: 'submissionId and email are required' });
      return;
    }

    const id = randomUUID();
    const payload = {
      id,
      submission_id: submissionId,
      email: String(email).trim().toLowerCase(),
      name: name || null,
      role: role || null,
      is_arizona: Boolean(isArizona),
      interview_opt_in: Boolean(interviewOptIn),
      group_version_opt_in: Boolean(groupVersionOptIn),
      kit_opt_in: Boolean(kitOptIn),
      consent_to_outreach: true,
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_contacts`, {
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
      console.error('save-contact supabase error', insertRes.status, text);
      res.status(502).json({ error: 'persistence failed' });
      return;
    }

    // Fire-and-forget Kit push (don't block response on it).
    if (payload.interview_opt_in || payload.group_version_opt_in || payload.kit_opt_in) {
      pushToKit(payload).catch(e => console.error('Kit push failed:', e));
    }

    res.status(200).json({
      id,
      schedulingUrl: payload.interview_opt_in ? SCHEDULING_URL : null,
    });
  } catch (err) {
    console.error('save-contact unexpected error', err);
    res.status(500).json({ error: 'save failed' });
  }
}

async function pushToKit({ email, name, role, interview_opt_in, group_version_opt_in, kit_opt_in }) {
  if (!KIT_API_KEY) {
    console.warn('save-contact: KIT_API_KEY unset — skipping Kit push');
    return;
  }
  const tags = [];
  if (interview_opt_in) tags.push('quiz-interview-prospect');
  if (group_version_opt_in) tags.push('quiz-group-version-notify');
  if (kit_opt_in) tags.push('quiz-subscriber');

  const res = await fetch('https://api.kit.com/v4/subscribers', {
    method: 'POST',
    headers: {
      'X-Kit-Api-Key': KIT_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      first_name: name || undefined,
      fields: role ? { role } : undefined,
      tags,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kit ${res.status}: ${text}`);
  }
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
