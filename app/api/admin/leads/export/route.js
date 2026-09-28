import { currentAdmin } from '@/lib/server/auth';
import { listLeads, getCommission } from '@/lib/server/leads';
import { monthOf, pkTime, saleValue, commissionOf } from '@/lib/leads-shared';

const cell = (v) => {
  const s = String(v ?? '');
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; // stop spreadsheet formula injection
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

// CSV of leads for a month (?month=YYYY-MM) or all time.
export async function GET(req) {
  if (!(await currentAdmin())) return new Response('Please log in again.', { status: 401 });
  const month = req.nextUrl.searchParams.get('month') || '';
  const commission = await getCommission();
  const leads = (await listLeads()).filter((l) => !month || monthOf(l.createdAt) === month).reverse();
  const head = ['Ref', 'Date (PKT)', 'Type', 'Status', 'Customer', 'Phone', 'Area', 'Items', 'Order total', 'Sale value', `Commission (${commission.rate}%)`, 'Source', 'Referrer', 'Campaign', 'Payment', 'TID', 'Note'];
  const rows = leads.map((l) => [
    l.id, pkTime(l.createdAt), l.type, l.status, l.customer.name, l.customer.phone, l.customer.area,
    l.items.map((i) => `${i.n}${i.v ? ` (${i.v})` : ''} x${i.q}`).join('; '), l.total || '',
    saleValue(l, commission) || '', commissionOf(l, commission) || '',
    l.source?.label, l.source?.referrer, l.source?.utm_campaign, l.payment?.name, l.payment?.txn, l.note,
  ]);
  const csv = '﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${month || 'all'}.csv"`,
    },
  });
}
