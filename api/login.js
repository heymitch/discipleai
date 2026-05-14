import crypto from 'node:crypto';

const COOKIE_NAME = 'disciple_session';
const SESSION_DAYS = 7;
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 60_000;

const attempts = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter(t => now - t < ATTEMPT_WINDOW_MS);
  list.push(now);
  attempts.set(ip, list);
  return list.length > MAX_ATTEMPTS;
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimit(ip)) {
    return res.status(429).json({ error: 'rate_limited' });
  }

  const hash = process.env.DASHBOARD_PASSWORD_HASH;
  const secret = process.env.SESSION_SECRET;
  if (!hash || !secret) {
    return res.status(500).json({ error: 'auth_not_configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const password = body?.password;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'password_required' });
  }

  const candidate = crypto.createHash('sha256').update(password).digest('hex');
  if (!timingSafeEqualStr(candidate, hash)) {
    return res.status(401).json({ error: 'invalid_password' });
  }

  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = String(exp);
  const sig = sign(payload, secret);
  const value = `${payload}.${sig}`;
  const maxAge = SESSION_DAYS * 24 * 60 * 60;

  res.setHeader('set-cookie',
    `${COOKIE_NAME}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`);
  return res.status(200).json({ ok: true });
}
