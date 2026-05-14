#!/usr/bin/env node
// Generate DASHBOARD_PASSWORD_HASH and SESSION_SECRET for Vercel env vars.
// Usage:
//   node scripts/hash-password.mjs               # prompts for password
//   node scripts/hash-password.mjs 'my-password' # one-shot
//
// Then set the printed values in Vercel:
//   vercel env add DASHBOARD_PASSWORD_HASH production
//   vercel env add SESSION_SECRET production

import crypto from 'node:crypto';
import readline from 'node:readline';

async function prompt(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise(resolve => rl.question(q, ans => { rl.close(); resolve(ans); }));
}

const arg = process.argv[2];
const password = arg ?? await prompt('Password: ');

if (!password || password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');
const secret = crypto.randomBytes(32).toString('hex');

console.log('');
console.log('Add these to Vercel (production environment):');
console.log('');
console.log('  DASHBOARD_PASSWORD_HASH=' + hash);
console.log('  SESSION_SECRET=' + secret);
console.log('');
console.log('Or set via CLI:');
console.log(`  echo "${hash}" | vercel env add DASHBOARD_PASSWORD_HASH production`);
console.log(`  echo "${secret}" | vercel env add SESSION_SECRET production`);
console.log('');
