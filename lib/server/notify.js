// New-order alerts to the nursery by email (Resend), Telegram (bot) and/or WhatsApp (Meta Cloud API).
// Secrets live in environment variables; who receives alerts is set in Admin → Order alerts.
import { getItem, setItem } from './store';
import { BRAND } from '../brand';
import { deliveryLine, mapsLink } from '../whatsapp';

const ENV = {
  resendKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.ALERT_FROM_EMAIL || `${BRAND.short} <onboarding@resend.dev>`,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  waToken: process.env.WHATSAPP_TOKEN,
  waPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
};
const API = {
  resend: process.env.RESEND_API_URL || 'https://api.resend.com',
  telegram: process.env.TELEGRAM_API_URL || 'https://api.telegram.org',
  whatsapp: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0',
};

export const DEFAULT_NOTIFY = {
  email: { enabled: false, to: '' },
  telegram: { enabled: false, chatIds: '' },
  whatsapp: { enabled: false, to: BRAND.whatsapp, template: 'new_order_alert', lang: 'en' },
  contactLeads: false, // also alert on WhatsApp/call button clicks
};

export const configured = () => ({
  email: Boolean(ENV.resendKey),
  telegram: Boolean(ENV.telegramToken),
  whatsapp: Boolean(ENV.waToken && ENV.waPhoneId),
});

export async function getNotify() {
  const s = (await getItem('notify')) || {};
  return {
    email: { ...DEFAULT_NOTIFY.email, ...s.email },
    telegram: { ...DEFAULT_NOTIFY.telegram, ...s.telegram },
    whatsapp: { ...DEFAULT_NOTIFY.whatsapp, ...s.whatsapp },
    contactLeads: Boolean(s.contactLeads),
  };
}

const str = (v, max = 300) => String(v ?? '').trim().slice(0, max);
export async function saveNotify(input = {}) {
  const next = {
    email: { enabled: Boolean(input.email?.enabled), to: str(input.email?.to) },
    telegram: { enabled: Boolean(input.telegram?.enabled), chatIds: str(input.telegram?.chatIds).replace(/[^0-9,\-\s]/g, '') },
    whatsapp: {
      enabled: Boolean(input.whatsapp?.enabled),
      to: str(input.whatsapp?.to, 40).replace(/\D/g, '').replace(/^0/, '92'),
      template: str(input.whatsapp?.template, 60).replace(/[^a-z0-9_]/g, '') || DEFAULT_NOTIFY.whatsapp.template,
      lang: str(input.whatsapp?.lang, 10) || 'en',
    },
    contactLeads: Boolean(input.contactLeads),
  };
  await setItem('notify', next);
  return next;
}

const rs = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;
const list = (v) => String(v || '').split(/[,\s]+/).map((x) => x.trim()).filter(Boolean);

/** Short plain-text summary used for email and Telegram. */
export function alertText(lead) {
  const c = lead.customer;
  if (lead.type !== 'order') {
    return [`🔔 Website ${lead.type === 'call' ? 'call' : 'WhatsApp'} lead ${lead.id}`, lead.note, `Source: ${lead.source?.label || 'direct'}`].filter(Boolean).join('\n');
  }
  return [
    `🌱 New order ${lead.id}`,
    `${c.name} · ${c.phone}`,
    `${c.address}, ${c.area}, ${c.city || BRAND.city}`,
    mapsLink(c) && `Map: ${mapsLink(c)}`,
    '',
    ...lead.items.map((it) => `• ${it.n}${it.v ? ` (${it.v})` : ''} ×${it.q} — ${rs(it.p * it.q)}`),
    '',
    `Products: ${rs(lead.subtotal)}`,
    `Delivery: ${deliveryLine(lead)}`,
    `Total: ${rs(lead.total)}`,
    `Payment: ${lead.payment?.name || '-'}${lead.payment?.txn ? ` (TID ${lead.payment.txn})` : ''}`,
    c.notes && `Notes: ${c.notes}`,
    `Source: ${lead.source?.label || 'direct'}`,
  ].filter((x) => x !== false && x !== undefined && x !== null).join('\n');
}

async function post(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000), cache: 'no-store',
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.ok === false) throw new Error(j.message || j.description || j.error?.message || `HTTP ${res.status}`);
  return j;
}

const channels = {
  async email(s, lead, text) {
    const to = list(s.email.to);
    if (!to.length) throw new Error('No email address set');
    const subject = lead ? (lead.type === 'order' ? `New order ${lead.id} — ${rs(lead.total)} (${lead.customer.name})` : `Website ${lead.type} lead ${lead.id}`) : `Test alert from ${BRAND.short}`;
    await post(`${API.resend}/emails`, { from: ENV.emailFrom, to, subject, text }, { Authorization: `Bearer ${ENV.resendKey}` });
  },
  async telegram(s, lead, text) {
    const ids = list(s.telegram.chatIds);
    if (!ids.length) throw new Error('No Telegram chat ID set');
    for (const chat_id of ids) await post(`${API.telegram}/bot${ENV.telegramToken}/sendMessage`, { chat_id, text, disable_web_page_preview: true });
  },
  async whatsapp(s, lead) {
    const to = s.whatsapp.to;
    if (!to) throw new Error('No WhatsApp number set');
    // Template variables can't contain line breaks, so keep each one on a single line.
    const one = (v) => String(v || '-').replace(/\s*\n\s*/g, ' | ').replace(/\s{4,}/g, ' ').slice(0, 900);
    const l = lead || { id: 'TEST', customer: { name: 'Test customer', phone: '0300 0000000', address: 'Test address', area: 'Lahore' }, items: [], subtotal: 0, total: 0 };
    const params = [
      l.id,
      `${l.customer.name} (${l.customer.phone})`,
      `${l.customer.address}, ${l.customer.area}`,
      l.items.map((it) => `${it.n} x${it.q}`).join(', ') || 'Test message',
      `${rs(l.total)} incl. delivery ${l.shipping ? deliveryLine(l) : '-'}`,
      l.payment?.name || '-',
    ].map((t) => ({ type: 'text', text: one(t) }));
    await post(`${API.whatsapp}/${ENV.waPhoneId}/messages`, {
      messaging_product: 'whatsapp', to, type: 'template',
      template: { name: s.whatsapp.template, language: { code: s.whatsapp.lang }, components: [{ type: 'body', parameters: params }] },
    }, { Authorization: `Bearer ${ENV.waToken}` });
  },
};

/** Send to every enabled + configured channel. Returns [{ channel, ok, error }]. */
export async function sendAlert(lead, only) {
  const s = await getNotify();
  if (lead && lead.type !== 'order' && !s.contactLeads && !only) return [];
  const conf = configured();
  const text = lead ? alertText(lead) : `✅ Test alert from ${BRAND.short} website. Order alerts will arrive here.`;
  const names = only ? [only] : Object.keys(channels).filter((c) => s[c].enabled);
  return Promise.all(names.map(async (c) => {
    if (!conf[c]) return { channel: c, ok: false, error: 'Not connected (missing key in Vercel settings)' };
    try { await channels[c](s, lead, text); return { channel: c, ok: true }; } catch (e) { return { channel: c, ok: false, error: e.message }; }
  }));
}

/** Chats that have messaged the Telegram bot — used to find the nursery's chat ID. */
export async function telegramChats() {
  if (!ENV.telegramToken) throw new Error('TELEGRAM_BOT_TOKEN is not set in Vercel.');
  const res = await fetch(`${API.telegram}/bot${ENV.telegramToken}/getUpdates`, { signal: AbortSignal.timeout(8000), cache: 'no-store' });
  const j = await res.json();
  if (!j.ok) throw new Error(j.description || 'Telegram error');
  const seen = new Map();
  for (const u of j.result || []) {
    const chat = (u.message || u.channel_post || u.my_chat_member)?.chat;
    if (chat) seen.set(chat.id, { id: chat.id, name: chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.username || 'Chat' });
  }
  return [...seen.values()];
}
