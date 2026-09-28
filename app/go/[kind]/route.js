import { NextResponse, after } from 'next/server';
import { createLead, readSource, tooMany, clientIp, isBot, logAlerts } from '@/lib/server/leads';
import { sendAlert } from '@/lib/server/notify';
import { BRAND } from '@/lib/brand';
import { waLink } from '@/lib/whatsapp';

// Tracked contact links: /go/whatsapp and /go/call record a lead (with a reference number)
// and then send the visitor on to WhatsApp or the phone dialler.
export async function GET(req, { params }) {
  const { kind } = await params;
  if (kind !== 'whatsapp' && kind !== 'call') return NextResponse.redirect(new URL('/', req.url));
  const q = req.nextUrl.searchParams;
  const item = (q.get('item') || '').slice(0, 120);

  let ref = '';
  if (!isBot(req) && !tooMany(clientIp(req), 'go', 20)) {
    try {
      const lead = await createLead({
        type: kind,
        source: readSource(req),
        page: (q.get('page') || req.headers.get('referer') || '').slice(0, 200),
        note: [q.get('src') && `button: ${q.get('src')}`, item && `item: ${item}`].filter(Boolean).join(' · '),
      });
      ref = lead.id;
      after(async () => { try { await logAlerts(lead.id, await sendAlert(lead)); } catch {} });
    } catch {
      // never block the customer from reaching us because tracking failed
    }
  }

  if (kind === 'call') return NextResponse.redirect(`tel:${BRAND.phoneIntl}`, 302);
  const text = `Assalam o Alaikum! I found ${BRAND.short} on your website${item ? ` and I'm interested in: ${item}` : ''}.${ref ? `\n(Ref: ${ref})` : ''}`;
  return NextResponse.redirect(waLink(text), 302);
}
