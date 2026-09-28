import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/server/auth';
import { getDelivery, saveDelivery } from '@/lib/server/delivery';
import { listLeads } from '@/lib/server/leads';
import { estimate } from '@/lib/delivery';

const deny = () => NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

// Compare recorded actual fares against the estimates, per method (last 30 each).
async function fareCheck(settings) {
  const leads = (await listLeads()).filter((l) => l.shipping?.kind === 'local' && l.shipping.actual != null && l.shipping.km != null);
  return settings.methods.filter((m) => m.kind === 'local').map((m) => {
    const rows = leads.filter((l) => l.shipping.method === m.id).slice(0, 30);
    if (!rows.length) return { id: m.id, name: m.name, count: 0 };
    const actual = rows.reduce((s, l) => s + l.shipping.actual, 0) / rows.length;
    const est = rows.reduce((s, l) => s + estimate(m, l.shipping.km, 0).low, 0) / rows.length;
    return { id: m.id, name: m.name, count: rows.length, actual: Math.round(actual), estimate: Math.round(est), diffPct: Math.round(((actual - est) / est) * 100) };
  });
}

export async function GET() {
  if (!(await currentAdmin())) return deny();
  const delivery = await getDelivery();
  return NextResponse.json({ delivery, check: await fareCheck(delivery) });
}

export async function PUT(req) {
  if (!(await currentAdmin())) return deny();
  const body = await req.json().catch(() => ({}));
  try {
    const delivery = await saveDelivery(body.delivery);
    return NextResponse.json({ delivery, check: await fareCheck(delivery) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
