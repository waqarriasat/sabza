import { NextResponse } from 'next/server';
import { createLead, readSource, tooMany, clientIp } from '@/lib/server/leads';
import { getPayments } from '@/lib/server/payments';
import { orderMessage, waLink } from '@/lib/whatsapp';

// Checkout "Place order": save the order as a lead, return its reference + WhatsApp link.
export async function POST(req) {
  if (tooMany(clientIp(req), 'order', 8)) {
    return NextResponse.json({ error: 'Too many orders from this connection. Please WhatsApp us instead.' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const c = body.customer || {};
  const phone = String(c.phone || '').replace(/[\s-]/g, '').replace(/^(\+92|0092|92)/, '0');
  if (!String(c.name || '').trim()) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!/^03\d{9}$/.test(phone)) return NextResponse.json({ error: 'Please enter a valid mobile number, e.g. 0300 1234567.' }, { status: 400 });
  if (!String(c.area || '').trim() || !String(c.address || '').trim()) return NextResponse.json({ error: 'Please enter your area and full address.' }, { status: 400 });
  if (!Array.isArray(body.items) || body.items.length === 0) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });

  const methods = await getPayments();
  const m = methods.find((x) => x.id === body.payment?.id && x.enabled);
  if (!m) return NextResponse.json({ error: 'Please choose a payment method.' }, { status: 400 });

  try {
    const lead = await createLead({
      type: 'order',
      source: readSource(req),
      page: '/checkout',
      customer: { ...c, phone },
      items: body.items,
      payment: { id: m.id, name: m.name, txn: body.payment?.txn },
    });
    return NextResponse.json({ id: lead.id, total: lead.total, whatsapp: waLink(orderMessage(lead)) });
  } catch (e) {
    return NextResponse.json({ error: 'Could not save your order. Please WhatsApp us instead.' }, { status: 500 });
  }
}
