import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/server/auth';
import { listLeads, updateLead, getCommission, saveCommission } from '@/lib/server/leads';

const deny = () => NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

export async function GET() {
  if (!(await currentAdmin())) return deny();
  return NextResponse.json({ leads: await listLeads(), commission: await getCommission() });
}

// Update one lead's status / sale amount / add a note. Leads can't be deleted.
export async function PATCH(req) {
  const admin = await currentAdmin();
  if (!admin) return deny();
  const { id, status, saleAmount, note } = await req.json().catch(() => ({}));
  try {
    return NextResponse.json({ lead: await updateLead(id, { status, saleAmount, note }, admin.email) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// Commission settings
export async function PUT(req) {
  const admin = await currentAdmin();
  if (!admin) return deny();
  const body = await req.json().catch(() => ({}));
  try {
    return NextResponse.json({ commission: await saveCommission(body, admin.email) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
