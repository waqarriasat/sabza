import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/server/auth';
import { getNotify, saveNotify, configured, sendAlert, telegramChats } from '@/lib/server/notify';

const deny = () => NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

export async function GET() {
  if (!(await currentAdmin())) return deny();
  return NextResponse.json({ settings: await getNotify(), configured: configured() });
}

export async function PUT(req) {
  if (!(await currentAdmin())) return deny();
  const body = await req.json().catch(() => ({}));
  try {
    return NextResponse.json({ settings: await saveNotify(body.settings) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// { action: 'test', channel } or { action: 'telegram-chats' }
export async function POST(req) {
  if (!(await currentAdmin())) return deny();
  const { action, channel } = await req.json().catch(() => ({}));
  try {
    if (action === 'test') {
      if (!['email', 'telegram', 'whatsapp'].includes(channel)) throw new Error('Unknown channel.');
      const [r] = await sendAlert(null, channel);
      return NextResponse.json(r, { status: r.ok ? 200 : 400 });
    }
    if (action === 'telegram-chats') return NextResponse.json({ chats: await telegramChats() });
    throw new Error('Unknown action.');
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
