// Admin login: scrypt-hashed password + HMAC-signed session cookie.
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getItem, setItem } from './store';

export const COOKIE = 'sabza_admin';
const SESSION_DAYS = 7;

// Initial login. Only the hash of the default password is kept in code;
// once the password is changed from the admin panel, the stored one is used.
const DEFAULT_ADMIN = {
  email: 'waqarriasat@gmail.com',
  hash: 'scrypt$f2b6bf1433e7cbb3f0b71cf8b0b54daa$5322d64b5cdec9b3e4f05c12469f9fbef5b3b1a4cd6e6c74928084a4b533597d899af02ded652dbb2a922c9dcfe83a9fd0c2d1da0147476424dce302e8df3a04',
  ver: 1,
};

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `scrypt$${salt}$${crypto.scryptSync(pw, salt, 64).toString('hex')}`;
}

function checkPassword(pw, stored) {
  const [, salt, hex] = stored.split('$');
  const want = Buffer.from(hex, 'hex');
  const got = crypto.scryptSync(pw, salt, want.length);
  return crypto.timingSafeEqual(want, got);
}

export async function getAdmin() {
  return (await getItem('admin')) || DEFAULT_ADMIN;
}

async function secret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  let s = await getItem('auth-secret');
  if (!s) {
    s = crypto.randomBytes(32).toString('hex');
    await setItem('auth-secret', s);
  }
  return s;
}

const sign = (data, key) => crypto.createHmac('sha256', key).update(data).digest('base64url');

async function makeToken(admin) {
  const body = Buffer.from(JSON.stringify({
    e: admin.email, v: admin.ver, exp: Date.now() + SESSION_DAYS * 864e5,
  })).toString('base64url');
  return `${body}.${sign(body, await secret())}`;
}

/** Returns the admin record if the request carries a valid session, else null. */
export async function currentAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const want = Buffer.from(sign(body, await secret()));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;
  let p;
  try { p = JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; }
  const admin = await getAdmin();
  // a password change bumps `ver`, which signs out every other session
  if (p.exp < Date.now() || p.e !== admin.email || p.v !== admin.ver) return null;
  return admin;
}

async function startSession(admin) {
  (await cookies()).set(COOKIE, await makeToken(admin), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function login(email, password) {
  const admin = await getAdmin();
  const ok = String(email || '').trim().toLowerCase() === admin.email.toLowerCase()
    && checkPassword(String(password || ''), admin.hash);
  if (!ok) return false;
  await startSession(admin);
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

/** Change login email and/or password. Keeps the current browser signed in. */
export async function updateCredentials({ current, email, password }) {
  const admin = await getAdmin();
  if (!checkPassword(String(current || ''), admin.hash)) return { error: 'Current password is incorrect.' };
  const next = { ...admin, ver: admin.ver + 1 };
  if (email) {
    const e = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { error: 'Enter a valid email address.' };
    next.email = e;
  }
  if (password) {
    if (String(password).length < 8) return { error: 'New password must be at least 8 characters.' };
    next.hash = hashPassword(String(password));
  }
  await setItem('admin', next);
  await startSession(next);
  return { ok: true, email: next.email };
}
