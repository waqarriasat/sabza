import crypto from 'crypto';
import { getItem, setItem } from './store';
import { DEFAULT_PAYMENTS, PAYMENT_KINDS } from '../payments';

export async function getPayments() {
  return (await getItem('payments')) || DEFAULT_PAYMENTS;
}

const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const id = (v) => str(v, 40).replace(/[^a-zA-Z0-9_-]/g, '') || crypto.randomBytes(5).toString('hex');

/** Validate + normalise a full list from the admin panel, then save it. */
export async function savePayments(input) {
  if (!Array.isArray(input) || input.length > 50) throw new Error('Invalid payment list.');
  const seen = new Set();
  const list = input.map((p) => {
    let pid = id(p.id);
    while (seen.has(pid)) pid += '-2';
    seen.add(pid);
    const name = str(p.name, 60);
    if (!name) throw new Error('Every payment method needs a name.');
    return {
      id: pid,
      kind: PAYMENT_KINDS[p.kind] ? p.kind : 'other',
      name,
      desc: str(p.desc, 140),
      badge: str(p.badge, 30),
      color: /^#[0-9a-fA-F]{3,8}$/.test(p.color) ? p.color : '#5DA13B',
      logo: str(p.logo, 5) || name.slice(0, 2).toUpperCase(),
      enabled: Boolean(p.enabled),
      instructions: str(p.instructions, 600),
      accounts: (Array.isArray(p.accounts) ? p.accounts : []).slice(0, 20).map((a) => ({
        id: id(a.id),
        bank: str(a.bank, 80),
        title: str(a.title, 80),
        number: str(a.number, 40),
        iban: str(a.iban, 40).toUpperCase().replace(/\s+/g, ''),
        active: a.active !== false,
      })),
    };
  });
  await setItem('payments', list);
  return list;
}
