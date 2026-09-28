import { NextResponse, after } from 'next/server';
import { createLead, readSource, tooMany, clientIp, logAlerts } from '@/lib/server/leads';
import { sendAlert } from '@/lib/server/notify';
import { getPayments } from '@/lib/server/payments';
import { orderMessage, waLink } from '@/lib/whatsapp';
import { getDelivery } from '@/lib/server/delivery';
import { geocode, roadKm, inLahore } from '@/lib/server/geo';
import { estimate, etaOf, courierCheck, codAllowed } from '@/lib/delivery';
import { BRAND } from '@/lib/brand';

// Work out the delivery charge on the server from the customer's choice (never trust a price from the browser).
async function priceDelivery(choice = {}, items, customer) {
  const settings = await getDelivery();
  const m = settings.methods.find((x) => x.id === choice.method && x.enabled);
  if (!m) throw new Error('Please choose a delivery method.');
  if (m.kind !== 'courier' && !m.plants && items.some((it) => it.plant !== false)) throw new Error(`${m.name} can't carry live plants. Please choose another delivery method.`);
  if (m.kind === 'pickup') return { method: m.id, name: m.name, kind: m.kind, eta: etaOf(m), fee: 0, km: null, city: BRAND.city };
  if (m.kind === 'courier') {
    const city = String(choice.city || '').trim();
    if (!city) throw new Error('Please enter your city for courier delivery.');
    const chk = courierCheck(m, items.map((it) => ({ ...it, q: Math.max(1, parseInt(it.q, 10) || 1) })));
    if (!chk.ok) throw new Error(chk.reason);
    return { method: m.id, name: m.name, kind: m.kind, eta: etaOf(m), fee: chk.fee, kg: chk.kg, km: null, city };
  }
  let km = null, how = '';
  const pt = Number.isFinite(choice.lat) && Number.isFinite(choice.lng) ? { lat: choice.lat, lng: choice.lng } : null;
  if (pt && inLahore(pt)) ({ km, how } = await roadKm(settings.origin, pt));
  if (km == null) {
    const area = settings.areas.find((a) => a.name === choice.area);
    if (area) { km = area.km; how = 'area'; }
  }
  if (km == null) {
    const g = await geocode(`${customer.address || ''}, ${customer.area || ''}`);
    if (g && inLahore(g)) ({ km, how } = await roadKm(settings.origin, g));
  }
  if (km == null) throw new Error('We could not work out your distance. Tap “Use my current location” or pick your area.');
  return { method: m.id, name: m.name, kind: m.kind, eta: etaOf(m), fee: estimate(m, km).low, km, how, perKm: m.perKm, city: BRAND.city };
}

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

  let delivery;
  try {
    delivery = await priceDelivery(body.delivery, body.items, c);
    if (m.kind === 'cod' && !codAllowed((await getDelivery()).methods.find((x) => x.id === delivery.method))) {
      throw new Error(`Cash on Delivery isn't available with ${delivery.name}. Please pay in advance by JazzCash, Easypaisa or bank transfer.`);
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  try {
    const lead = await createLead({
      type: 'order',
      source: readSource(req),
      page: '/checkout',
      customer: { ...c, phone, city: delivery.city, lat: body.delivery?.lat, lng: body.delivery?.lng },
      delivery,
      items: body.items,
      payment: { id: m.id, name: m.name, txn: body.payment?.txn },
    });
    // alert the nursery after the customer gets their response
    after(async () => { try { await logAlerts(lead.id, await sendAlert(lead)); } catch {} });
    return NextResponse.json({ id: lead.id, subtotal: lead.subtotal, delivery: lead.delivery, total: lead.total, shipping: lead.shipping, whatsapp: waLink(orderMessage(lead)) });
  } catch (e) {
    return NextResponse.json({ error: 'Could not save your order. Please WhatsApp us instead.' }, { status: 500 });
  }
}
