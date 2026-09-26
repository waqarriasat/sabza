import { NextResponse } from 'next/server';
import { login } from '@/lib/server/auth';

// Basic brute-force protection: 10 failed tries per IP per 15 minutes.
const fails = new Map();
const WINDOW = 15 * 60 * 1000;

export async function POST(req) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  const now = Date.now();
  const rec = fails.get(ip);
  if (rec && now - rec.t < WINDOW && rec.n >= 10) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }
  const { email, password } = await req.json().catch(() => ({}));
  if (await login(email, password)) {
    fails.delete(ip);
    return NextResponse.json({ ok: true });
  }
  fails.set(ip, rec && now - rec.t < WINDOW ? { n: rec.n + 1, t: rec.t } : { n: 1, t: now });
  return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
}
