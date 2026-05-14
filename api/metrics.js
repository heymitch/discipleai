import crypto from 'node:crypto';

const COOKIE_NAME = 'disciple_session';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// ── auth ─────────────────────────────────────────────────────────────────────
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function verifySession(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return false;
  const [exp, sig] = raw.split('.');
  if (!exp || !sig) return false;
  const expected = crypto.createHmac('sha256', secret).update(exp).digest('hex');
  const ok = expected.length === sig.length &&
    crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sig, 'utf8'));
  if (!ok) return false;
  if (Date.now() > Number(exp)) return false;
  return true;
}

// ── supabase ─────────────────────────────────────────────────────────────────
// Calls public.dashboard_funnel_metrics() RPC. The function is SECURITY DEFINER
// and returns only aggregate counts, so the anon key has just enough access.
async function fetchQuizFunnel() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { configured: false };
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/dashboard_funnel_metrics`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'content-type': 'application/json',
      },
      body: '{}',
    });
    if (!r.ok) {
      console.error('dashboard_funnel_metrics RPC failed', r.status, await r.text());
      return { configured: true, error: 'rpc_failed' };
    }
    const data = await r.json();
    return { configured: true, ...data };
  } catch (err) {
    console.error('dashboard_funnel_metrics fetch error', err);
    return { configured: true, error: 'fetch_failed' };
  }
}

async function fetchSubstack() {
  try {
    const res = await fetch('https://discipleai.substack.com/feed', {
      headers: { 'user-agent': 'disciple-dashboard/1.0' },
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
    const titleOf = block => {
      const m = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || block.match(/<title>(.*?)<\/title>/);
      return m ? m[1] : null;
    };
    return {
      post_count: items.length,
      latest_post: items[0] ? titleOf(items[0]) : null,
    };
  } catch {
    return null;
  }
}

// ── handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (!verifySession(req)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const [quiz, sub] = await Promise.all([fetchQuizFunnel(), fetchSubstack()]);
  const funnelLive = quiz.configured && !quiz.error;

  res.setHeader('cache-control', 'private, max-age=60');
  return res.status(200).json({
    updated_at: new Date().toISOString(),
    funnel: {
      visits: null,
      visits_delta: null,
      quiz_started:   funnelLive ? quiz.quiz_started   : null,
      start_rate:     null,
      quiz_completes: funnelLive ? quiz.quiz_completes : null,
      complete_rate:  funnelLive ? quiz.complete_rate  : null,
      optins:         funnelLive ? quiz.optins         : null,
      optin_rate:     funnelLive ? quiz.optin_rate     : null,
      open_to_meet:   funnelLive ? quiz.open_to_meet   : null,
      otm_rate:       funnelLive ? quiz.otm_rate       : null,
      booked: null,
      booked_rate: null,
    },
    bench_note: funnelLive
      ? (quiz.quiz_completes > 0
          ? `${quiz.quiz_completes} completed · ${quiz.optins} opt-ins`
          : 'Awaiting first completion')
      : 'Supabase not configured',
    emails: [
      { num: 1, delivered: null, open_rate: null, ctr: null, reply_rate: null, unsubscribed: null, bounced: null },
      { num: 2, delivered: null, open_rate: null, ctr: null, reply_rate: null, unsubscribed: null, bounced: null },
      { num: 3, delivered: null, open_rate: null, ctr: null, reply_rate: null, unsubscribed: null, bounced: null },
      { num: 4, delivered: null, open_rate: null, ctr: null, reply_rate: null, unsubscribed: null, bounced: null },
      { num: 5, delivered: null, open_rate: null, ctr: null, reply_rate: null, unsubscribed: null, bounced: null },
    ],
    cold: {
      sent: null, opened: null, open_rate: null,
      replied: null, reply_rate: null,
      booked: null, booked_rate: null, bounced: null,
    },
    substack: sub
      ? { subscribers: null, post_count: sub.post_count, latest_post: sub.latest_post, avg_open_rate: null, avg_ctr: null, growth_30d: null }
      : { subscribers: null, post_count: null, latest_post: null, avg_open_rate: null, avg_ctr: null, growth_30d: null },
    sources: {
      funnel:   funnelLive
                  ? { status: 'live', note: 'Supabase RPC · dashboard_funnel_metrics · live' }
                  : { status: 'pending', note: 'SUPABASE env vars missing' },
      emails:   { status: 'pending', note: 'ConvertKit webhooks · pending wiring' },
      cold:     { status: 'pending', note: 'Manual via Gmail / Apollo · pending CSV import' },
      substack: { status: sub ? 'live' : 'pending', note: sub ? 'RSS · live' : 'RSS · unreachable' },
    },
  });
}
