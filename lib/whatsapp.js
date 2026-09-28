import { BRAND } from './brand';

export const waLink = (text) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
const rs = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;

export function deliveryLine(lead) {
  const s = lead.shipping;
  if (!s) return lead.delivery ? rs(lead.delivery) : '-';
  if (s.kind === 'pickup') return `${s.name} (no charge)`;
  if (s.kind === 'courier') return `${s.name} — ${rs(lead.delivery)}`;
  return `${s.name} — ${s.km} km — ${rs(lead.delivery)}`;
}
export const mapsLink = (c) => (c.lat != null ? `https://www.google.com/maps?q=${c.lat},${c.lng}` : '');

export function orderMessage(lead) {
  const c = lead.customer;
  const lines = [
    'Assalam o Alaikum! New order from the website.',
    `Ref: ${lead.id}`,
    '',
    `Name: ${c.name}`,
    `Phone: ${c.phone}`,
    `Area: ${c.area}, ${c.city || BRAND.city}`,
    `Address: ${c.address}`,
    '',
    'Items:',
    ...lead.items.map((it) => `- ${it.n}${it.v ? ` (${it.v})` : ''} x${it.q} = ${rs(it.p * it.q)}`),
    '',
    `Subtotal: ${rs(lead.subtotal)}`,
    `Delivery: ${deliveryLine(lead)}`,
    `Total: ${rs(lead.total)}`,
    `Payment: ${lead.payment?.name || '-'}${lead.payment?.txn ? ` (TID: ${lead.payment.txn})` : ''}`,
  ];
  if (c.notes) lines.push(`Notes: ${c.notes}`);
  if (mapsLink(c)) lines.push(`Location: ${mapsLink(c)}`);
  return lines.join('\n');
}
