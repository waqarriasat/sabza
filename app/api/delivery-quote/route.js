import { NextResponse } from 'next/server';
import { getDelivery } from '@/lib/server/delivery';
import { geocode, roadKm, inLahore } from '@/lib/server/geo';
import { tooMany, clientIp } from '@/lib/server/leads';

// Checkout asks: how far is this address / GPS point from the nursery?
export async function POST(req) {
  if (tooMany(clientIp(req), 'quote', 40)) return NextResponse.json({ error: 'Too many requests — please pick your area instead.' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  let point = null;
  if (Number.isFinite(body.lat) && Number.isFinite(body.lng)) {
    point = { lat: body.lat, lng: body.lng, label: 'Your current location' };
  } else {
    point = await geocode(body.address);
    if (!point) return NextResponse.json({ error: "We couldn't find that address on the map. Try adding your area/block, use your current location, or pick your area below." }, { status: 404 });
  }
  if (!inLahore(point)) return NextResponse.json({ error: 'That location is outside Lahore. Live plants are delivered in Lahore only — courier is available for other items.' }, { status: 400 });
  const { origin } = await getDelivery();
  const r = await roadKm(origin, point);
  return NextResponse.json({ km: r.km, how: r.how, lat: point.lat, lng: point.lng, label: point.label });
}
