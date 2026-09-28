import { getItem, setItem } from './store';
import { DEFAULT_DELIVERY } from '../delivery';

export async function getDelivery() {
  const d = await getItem('delivery');
  return d ? { ...DEFAULT_DELIVERY, ...d } : DEFAULT_DELIVERY;
}

const str = (v, max = 120) => String(v ?? '').trim().slice(0, max);
const num = (v, max = 1e6) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
const KINDS = ['local', 'pickup', 'courier'];

export async function saveDelivery(input) {
  if (!input || !Array.isArray(input.methods) || !Array.isArray(input.areas)) throw new Error('Invalid delivery settings.');
  const seen = new Set();
  const methods = input.methods.slice(0, 20).map((m) => {
    let id = str(m.id, 30).replace(/[^a-z0-9_-]/gi, '') || Math.random().toString(36).slice(2, 8);
    while (seen.has(id)) id += '2';
    seen.add(id);
    const name = str(m.name, 60);
    if (!name) throw new Error('Every delivery method needs a name.');
    return {
      id, name, kind: KINDS.includes(m.kind) ? m.kind : 'local', desc: str(m.desc, 140), eta: str(m.eta, 60),
      enabled: Boolean(m.enabled), plants: m.plants !== false, cod: Boolean(m.cod),
      min: num(m.min), perKm: num(m.perKm), flat: num(m.flat), perKg: num(m.perKg), maxKg: num(m.maxKg, 1000),
    };
  });
  const areas = input.areas.slice(0, 200)
    .map((a) => ({ name: str(a.name, 60), km: Math.max(0, Math.min(200, Number(a.km) || 0)) }))
    .filter((a) => a.name);
  const lat = Number(input.origin?.lat), lng = Number(input.origin?.lng);
  if (!(lat > 23 && lat < 38 && lng > 60 && lng < 78)) throw new Error('Nursery location must be in Pakistan — paste its Google Maps link.');
  const origin = { lat, lng, label: str(input.origin?.label, 120) || 'Nursery' };
  const next = { rangePct: num(input.rangePct, 200), origin, methods, areas };
  await setItem('delivery', next);
  return next;
}
