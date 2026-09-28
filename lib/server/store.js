// Tiny key/value store used for admin settings (login, payment methods).
//
// Two backends, picked automatically:
//  1. Redis over REST (Upstash / Vercel Marketplace "Upstash for Redis").
//     Used when KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL +
//     UPSTASH_REDIS_REST_TOKEN) are set, with or without a prefix
//     like SABZA_. This is what makes changes persist on Vercel.
//  2. A JSON file on disk (DATA_DIR, default ./data). Used on a VPS / your own server.
//
// Values are stored as JSON.
import { promises as fs } from 'fs';
import path from 'path';

const PREFIX = 'sabza:';
// Vercel may add a custom prefix when connecting the database (e.g. SABZA_KV_REST_API_URL),
// so accept any prefix, as long as the URL and token share it.
function findRedisEnv() {
  for (const [urlSuffix, tokenSuffix] of [['KV_REST_API_URL', 'KV_REST_API_TOKEN'], ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']]) {
    for (const key of Object.keys(process.env)) {
      if (!key.endsWith(urlSuffix) || !process.env[key]) continue;
      const token = process.env[key.slice(0, -urlSuffix.length) + tokenSuffix];
      if (token) return [process.env[key], token];
    }
  }
  return [];
}
const [REST_URL, REST_TOKEN] = findRedisEnv();
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

function assertPersistent() {
  if (!storageInfo().persistent) {
    // On Vercel /tmp isn't shared between functions or kept between requests, so a
    // "successful" save here would silently vanish. Fail loudly instead.
    throw new Error('Database not connected. In Vercel open Storage → Upstash for Redis → Connect, then redeploy.');
  }
}

/** Read-modify-write the JSON file; `fn` gets the whole object and returns a result. */
function mutateFile(fn) {
  const run = queue.catch(() => {}).then(async () => {
    const all = await readFile();
    const result = fn(all);
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = DATA_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(all, null, 2));
    await fs.rename(tmp, DATA_FILE);
    return result;
  });
  queue = run;
  return run;
}

export async function getItem(key) {
  if (useRedis) {
    const v = await redis(['GET', PREFIX + key]);
    return v == null ? null : JSON.parse(v);
  }
  const all = await readFile();
  return all[key] ?? null;
}

export async function getMany(keys) {
  if (!keys.length) return [];
  if (useRedis) {
    const vals = await redis(['MGET', ...keys.map((k) => PREFIX + k)]);
    return vals.map((v) => (v == null ? null : JSON.parse(v)));
  }
  const all = await readFile();
  return keys.map((k) => all[k] ?? null);
}

export async function setItem(key, value) {
  assertPersistent();
  if (useRedis) {
    await redis(['SET', PREFIX + key, JSON.stringify(value)]);
    return;
  }
  await mutateFile((all) => { all[key] = value; });
}

/** Atomically increment a counter and return the new value. */
export async function incr(key) {
  assertPersistent();
  if (useRedis) return redis(['INCR', PREFIX + key]);
  return mutateFile((all) => (all[key] = (all[key] || 0) + 1));
}

/** Append a value to a list. */
export async function listPush(key, value) {
  assertPersistent();
  if (useRedis) return redis(['RPUSH', PREFIX + key, JSON.stringify(value)]);
  return mutateFile((all) => (all[key] = [...(all[key] || []), value]).length);
}

/** Whole list, oldest first. */
export async function listAll(key) {
  if (useRedis) return (await redis(['LRANGE', PREFIX + key, 0, -1])).map((v) => JSON.parse(v));
  const all = await readFile();
  return all[key] || [];
}
