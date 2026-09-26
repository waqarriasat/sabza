import { NextResponse } from 'next/server';
import { currentAdmin, updateCredentials } from '@/lib/server/auth';

export async function POST(req) {
  if (!(await currentAdmin())) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    const r = await updateCredentials(body);
    return NextResponse.json(r, { status: r.error ? 400 : 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
