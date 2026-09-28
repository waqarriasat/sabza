import { BRAND } from './brand';

export const waLink = (text) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
const rs = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;

export function orderMessage(lead) {
  const c = lead.customer;
  const lines = [
    'Assalam o Alaikum! New order from the website.',
    `Ref: ${lead.id}`,
    '',
    `Name: ${c.name}`,
    `Phone: ${c.phone}`,
    `Area: ${c.area}, ${BRAND.city}`,
    `Address: ${c.address}`,
    '',
    'Items:',
    ...lead.items.map((it) => `- ${it.n}${it.v ? ` (${it.v})` : ''} x${it.q} = ${rs(it.p * it.q)}`),
    '',
    `Subtotal: ${rs(lead.subtotal)}`,
    `Delivery: ${lead.delivery ? rs(lead.delivery) : 'FREE'}`,
    `Total: ${rs(lead.total)}`,
    `Payment: ${lead.payment?.name || '-'}${lead.payment?.txn ? ` (TID: ${lead.payment.txn})` : ''}`,
  ];
  if (c.notes) lines.push(`Notes: ${c.notes}`);
  return lines.join('\n');
}
