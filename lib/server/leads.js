// Every enquiry that comes from the website is saved here as a "lead" with a
// reference number (AIN-1001, AIN-1002 …). Leads are never deleted — status and
// sale-amount changes are appended to the lead's history — so both the nursery and
// the website partner can rely on the record when working out commission.
import { getItem, getMany, incr, listAll, listPush, setItem } from './store';
import { BRAND } from '../brand';

import { LEAD_STATUSES } from '../leads-shared';
const DEFAULT_COMMISSION = { rate: 0, basis: 'subtotal' }; // basis: subtotal (excl. delivery) | total

const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const money = (v) => Math.max(0, Math.round(Number(v) || 0));

/** Where the visitor came from: first-touch cookie set by the site, plus the request referrer. */
export function readSource(req) {
  let first = {};
  const raw = req.cookies?.get?.('ain_src')?.value;
  if (raw) { try { first = JSON.parse(decodeURIComponent(raw)); } catch {} }
  const label = first.s || first.ref || first.r || 'direct';
  return {
    label: str(label, 60),
    utm_source: str(first.s, 60), utm_medium: str(first.m, 60), utm_campaign: str(first.c, 80),
    ref: str(first.ref, 60), referrer: str(first.r, 120), landing: str(first.l, 200), firstVisit: str(first.t, 40),
  };
}

export async function createLead({ type, source, page, customer = {}, items = [], payment = null, delivery = null, note = '' }) {
  const seq = await incr('lead-seq');
  const id = `${BRAND.refPrefix}-${1000 + seq}`;
  const cleanItems = (Array.isArray(items) ? items : []).slice(0, 50).map((it) => ({
    n: str(it.n, 120), v: str(it.v, 80), p: money(it.p), q: Math.max(1, Math.min(99, parseInt(it.q, 10) || 1)),
  }));
  const subtotal = cleanItems.reduce((s, it) => s + it.p * it.q, 0);
  const deliveryFee = delivery ? money(delivery.fee) : 0;
  const lead = {
    id, seq, type,
    createdAt: new Date().toISOString(),
    page: str(page, 200),
    source: source || { label: 'direct' },
    customer: {
      name: str(customer.name, 80), phone: str(customer.phone, 20), email: str(customer.email, 120),
      area: str(customer.area, 80), city: str(customer.city, 60), address: str(customer.address, 300), notes: str(customer.notes, 300),
      lat: Number.isFinite(customer.lat) ? customer.lat : null, lng: Number.isFinite(customer.lng) ? customer.lng : null,
    },
    items: cleanItems, subtotal,
    // delivery = what the customer is charged for delivery (kept separate from the product price)
    delivery: deliveryFee, total: subtotal + deliveryFee,
    shipping: delivery ? {
      method: str(delivery.method, 30), name: str(delivery.name, 60), kind: str(delivery.kind, 20),
      km: Number.isFinite(delivery.km) ? delivery.km : null, how: str(delivery.how, 20), perKm: money(delivery.perKm),
      actual: null, // fare actually paid to the rider — entered by the nursery
    } : null,
    payment: payment ? { id: str(payment.id, 40), name: str(payment.name, 60), txn: str(payment.txn, 60) } : null,
    note: str(note, 300),
    status: 'new',
    saleAmount: null,
    history: [{ at: new Date().toISOString(), by: 'website', action: 'created' }],
  };
  await setItem(`lead:${id}`, lead);
  await listPush('leads', id);
  return lead;
}

/** All leads, newest first. */
export async function listLeads() {
  const ids = await listAll('leads');
  const leads = await getMany(ids.map((id) => `lead:${id}`));
  return leads.filter(Boolean).reverse();
}

export async function updateLead(id, changes, by) {
  const lead = await getItem(`lead:${str(id, 30)}`);
  if (!lead) throw new Error('Lead not found.');
  const at = new Date().toISOString();
  if (changes.status !== undefined && changes.status !== lead.status) {
    if (!LEAD_STATUSES.includes(changes.status)) throw new Error('Unknown status.');
    lead.history.push({ at, by, action: 'status', from: lead.status, to: changes.status });
    lead.status = changes.status;
  }
  if (changes.saleAmount !== undefined) {
    const v = changes.saleAmount === '' || changes.saleAmount === null ? null : money(changes.saleAmount);
    if (v !== lead.saleAmount) {
      lead.history.push({ at, by, action: 'sale amount', from: lead.saleAmount, to: v });
      lead.saleAmount = v;
    }
  }
  if (changes.deliveryFee !== undefined && changes.deliveryFee !== '' && money(changes.deliveryFee) !== lead.delivery) {
    const v = money(changes.deliveryFee);
    lead.history.push({ at, by, action: 'delivery charge', from: lead.delivery, to: v });
    lead.delivery = v;
    lead.total = lead.subtotal + v;
  }
  if (changes.deliveryActual !== undefined && lead.shipping) {
    const v = changes.deliveryActual === '' || changes.deliveryActual === null ? null : money(changes.deliveryActual);
    if (v !== lead.shipping.actual) {
      lead.history.push({ at, by, action: 'actual rider fare', from: lead.shipping.actual, to: v });
      lead.shipping.actual = v;
    }
  }
  if (changes.note) lead.history.push({ at, by, action: 'note', to: str(changes.note, 300) });
  await setItem(`lead:${lead.id}`, lead);
  return lead;
}

export async function getCommission() {
  return { ...DEFAULT_COMMISSION, ...((await getItem('commission')) || {}) };
}

export async function saveCommission({ rate, basis }, by) {
  const prev = await getCommission();
  const next = {
    rate: Math.max(0, Math.min(100, Number(rate) || 0)),
    basis: basis === 'total' ? 'total' : 'subtotal',
    updatedAt: new Date().toISOString(), updatedBy: by,
    log: [...(prev.log || []), { at: new Date().toISOString(), by, from: prev.rate, to: Number(rate) || 0 }].slice(-50),
  };
  await setItem('commission', next);
  return next;
}


// Very small per-IP limiter so one person can't flood the lead list.
const hits = new Map();
export function tooMany(ip, bucket, max, windowMs = 10 * 60 * 1000) {
  const k = `${bucket}:${ip}`;
  const now = Date.now();
  const h = (hits.get(k) || []).filter((t) => now - t < windowMs);
  h.push(now);
  hits.set(k, h);
  if (hits.size > 5000) hits.clear();
  return h.length > max;
}
export const clientIp = (req) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
export const isBot = (req) => /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|embedly|curl|wget/i.test(req.headers.get('user-agent') || '');

/** Record alert results on the lead's history. */
export async function logAlerts(id, results) {
  if (!results?.length) return;
  const lead = await getItem(`lead:${id}`);
  if (!lead) return;
  const at = new Date().toISOString();
  for (const r of results) lead.history.push({ at, by: 'system', action: 'alert', to: `${r.channel}: ${r.ok ? 'sent' : `failed (${r.error})`}` });
  await setItem(`lead:${id}`, lead);
}
