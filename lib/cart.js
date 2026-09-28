'use client';
// Shopping cart kept in the visitor's browser (localStorage), shared by every page.
import { useSyncExternalStore } from 'react';
import { isPlantProduct } from './delivery';

const KEY = 'ain-cart';
const EMPTY = [];
const listeners = new Set();
let cache = null;

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v : EMPTY;
  } catch {
    return EMPTY;
  }
}
function snapshot() {
  if (cache === null) cache = read();
  return cache;
}
function write(next) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  listeners.forEach((l) => l());
}
function subscribe(l) {
  listeners.add(l);
  const onStorage = (e) => { if (e.key === KEY) { cache = null; l(); } };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(l); window.removeEventListener('storage', onStorage); };
}

const toNum = (v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0);
const keyOf = (it) => `${it.id}|${it.v || ''}`;

/** Add a product. Accepts catalogue items ({ n, p, a, slug }) or explicit ({ id, n, v, p, a }). */
export function addToCart(item, qty = 1) {
  const it = { id: item.id || item.slug || item.n, n: item.n, v: item.v || '', p: toNum(item.p), a: item.a || 'foliage', plant: item.plant ?? isPlantProduct(item) };
  const list = snapshot();
  const k = keyOf(it);
  const found = list.find((x) => keyOf(x) === k);
  write(found
    ? list.map((x) => (keyOf(x) === k ? { ...x, q: Math.min(99, x.q + qty) } : x))
    : [...list, { ...it, q: qty }]);
}
export const setQty = (k, q) => write(snapshot().map((x) => (keyOf(x) === k ? { ...x, q: Math.max(1, Math.min(99, q)) } : x)));
export const removeFromCart = (k) => write(snapshot().filter((x) => keyOf(x) !== k));
export const clearCart = () => write([]);
export { keyOf };

export function useCart() {
  const items = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const count = items.reduce((s, x) => s + x.q, 0);
  const subtotal = items.reduce((s, x) => s + x.p * x.q, 0);
  return { items, count, subtotal };
}
