import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/server/auth';
import { getPayments, savePayments } from '@/lib/server/payments';

export async function GET() {
  if (!(await currentAdmin())) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  return NextResponse.json({ payments: await getPayments() });
}

export async function PUT(req) {
  if (!(await currentAdmin())) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  const { payments } = await req.json().catch(() => ({}));
  try {
    return NextResponse.json({ payments: await savePayments(payments) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
