// Tiny key/value store used for admin settings (login, payment methods).
//
// Two backends, picked automatically:
//  1. Redis over REST (Upstash / Vercel Marketplace "Upstash for Redis").
//     Used when KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL +
//     UPSTASH_REDIS_REST_TOKEN) are set. This is what makes changes persist on Vercel.
//  2. A JSON file on disk (DATA_DIR, default ./data). Used on a VPS / your own server.
//
// Values are stored as JSON.
import { promises as fs } from 'fs';
import path from 'path';

const PREFIX = 'sabza:';
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(REST_URL && REST_TOKEN);

// On Vercel the project folder is read-only; /tmp is writable but wiped often.
const onVercel = Boolean(process.env.VERCEL);
const DATA_DIR = process.env.DATA_DIR || (onVercel ? '/tmp/sabza-data' : path.join(process.cwd(), 'data'));
const DATA_FILE = path.join(DATA_DIR, 'store.json');

/** Where data is saved, and whether it survives restarts/redeploys. */
export function storageInfo() {
  if (useRedis) return { backend: 'redis', persistent: true };
  return { backend: 'file', persistent: !onVercel || Boolean(process.env.DATA_DIR) };
}

async function redis(cmd) {
  const res = await fetch(REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`Storage error: ${json.error || res.status}`);
  return json.result;
}

async function readFile() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    throw e;
  }
}

// serialise file writes so two saves never interleave
let queue = Promise.resolve();

export async function getItem(key) {
  if (useRedis) {
    const v = await redis(['GET', PREFIX + key]);
    return v == null ? null : JSON.parse(v);
  }
  const all = await readFile();
  return all[key] ?? null;
}

export async function setItem(key, value) {
  if (useRedis) {
    await redis(['SET', PREFIX + key, JSON.stringify(value)]);
    return;
  }
  queue = queue.then(async () => {
    const all = await readFile();
    all[key] = value;
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = DATA_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(all, null, 2));
    await fs.rename(tmp, DATA_FILE);
  });
  return queue;
}
