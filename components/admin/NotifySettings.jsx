'use client';
import { useEffect, useState } from 'react';

const CH = {
  telegram: {
    title: 'Telegram', cost: 'Free · instant', badge: 'Recommended',
    env: ['TELEGRAM_BOT_TOKEN'],
    steps: [
      'In Telegram, open @BotFather → send /newbot → choose a name (e.g. Ahsan Ijaz Orders). Copy the token it gives you.',
      'In Vercel → sabza → Settings → Environment Variables, add TELEGRAM_BOT_TOKEN = that token, then Redeploy.',
      'The nursery owner opens the new bot in Telegram and presses Start (or adds the bot to a group).',
      'Come back here and press “Find chat ID”, pick the chat, Save, then Send test.',
    ],
  },
  email: {
    title: 'Email', cost: 'Free (up to ~100 emails/day)',
    env: ['RESEND_API_KEY', 'ALERT_FROM_EMAIL (optional)'],
    steps: [
      'Create a free account at resend.com → API Keys → Create. Copy the key.',
      'In Vercel add RESEND_API_KEY = that key, then Redeploy.',
      'Until you verify your own domain in Resend, emails can only go to the email you signed up with. After buying a domain, verify it in Resend and set ALERT_FROM_EMAIL, e.g. "Ahsan Ijaz Nursery <orders@yourdomain.pk>".',
      'Enter the address(es) below, Save, then Send test.',
    ],
  },
  whatsapp: {
    title: 'WhatsApp', cost: 'Paid · about Rs 3–4 per alert',
    env: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
    steps: [
      'Create a Meta Business account (business.facebook.com) and verify the business.',
      'At developers.facebook.com create an app → add WhatsApp. Add a NEW phone number for the store (not 0322 4967913 — that one receives the alerts) and add a payment method.',
      'Create a message template named new_order_alert (category Utility, English) with this body:\n“New order {{1}}. Customer: {{2}}. Address: {{3}}. Items: {{4}}. Total: {{5}}. Payment: {{6}}.” — wait for approval.',
      'Create a permanent access token (System User). In Vercel add WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID, then Redeploy.',
      'Enter the number that should receive alerts below, Save, then Send test.',
    ],
  },
};

export default function NotifySettings({ notify }) {
  const [s, setS] = useState(null);
  const [conf, setConf] = useState({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState('');
  const [chats, setChats] = useState(null);

  useEffect(() => {
    fetch('/api/admin/notify', { cache: 'no-store' }).then((r) => r.json()).then((j) => {
      if (j.error) throw new Error(j.error);
      setS(j.settings); setConf(j.configured);
    }).catch((e) => notify(e.message, true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (c, k, v) => { setS((x) => ({ ...x, [c]: { ...x[c], [k]: v } })); setDirty(true); };
  const call = async (method, body) => {
    const res = await fetch('/api/admin/notify', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || 'Failed');
    return j;
  };
  async function save() {
    setBusy('save');
    try { const j = await call('PUT', { settings: s }); setS(j.settings); setDirty(false); notify('Alert settings saved'); } catch (e) { notify(e.message, true); } finally { setBusy(''); }
  }
  async function test(channel) {
    if (dirty) return notify('Save your changes first', true);
    setBusy(`test-${channel}`);
    try { await call('POST', { action: 'test', channel }); notify(`Test sent by ${CH[channel].title} — check it arrived`); } catch (e) { notify(`${CH[channel].title}: ${e.message}`, true); } finally { setBusy(''); }
  }
  async function findChats() {
    setBusy('chats');
    try { const j = await call('POST', { action: 'telegram-chats' }); setChats(j.chats); if (!j.chats.length) notify('No chats yet — open the bot in Telegram and press Start, then try again', true); } catch (e) { notify(e.message, true); } finally { setBusy(''); }
  }

  if (!s) return <div className="pnl"><div className="ph-soon">Loading…</div></div>;

  return (
    <>
      <div className="ptools">
        <div className="pinfo">Every new website order is sent to the nursery on the channels switched on below. The nursery can use one, two or all three.</div>
        <button className="btn btn-pri" disabled={!dirty || busy === 'save'} onClick={save}>{busy === 'save' ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</button>
      </div>

      <div className="alerts-grid">
        {['telegram', 'email', 'whatsapp'].map((c) => (
          <div className={`pnl alert-card${s[c].enabled ? ' on' : ''}`} key={c}>
            <div className="ah">
              <div><h3>{CH[c].title} {CH[c].badge && <span className="badge b-green">{CH[c].badge}</span>}</h3><small>{CH[c].cost}</small></div>
              <button type="button" className={`sw${s[c].enabled ? ' on' : ''}`} onClick={() => set(c, 'enabled', !s[c].enabled)} title={s[c].enabled ? 'Turn off' : 'Turn on'}><span /></button>
            </div>
            <p className={`conn ${conf[c] ? 'ok' : 'no'}`}>{conf[c] ? '● Connected' : `○ Not connected — add ${CH[c].env.join(' + ')} in Vercel`}</p>

            {c === 'telegram' && (
              <div className="field"><label>Chat ID(s)</label>
                <div className="arow"><input value={s.telegram.chatIds} onChange={(e) => set('telegram', 'chatIds', e.target.value)} placeholder="e.g. 123456789" />
                  <button type="button" className="btn btn-out" disabled={!conf.telegram || busy === 'chats'} onClick={findChats}>{busy === 'chats' ? '…' : 'Find chat ID'}</button></div>
                {chats?.length > 0 && <div className="chatlist">{chats.map((ch) => (
                  <button type="button" key={ch.id} className="chip" onClick={() => set('telegram', 'chatIds', [...new Set([...s.telegram.chatIds.split(/[,\s]+/).filter(Boolean), String(ch.id)])].join(', '))}>+ {ch.name} ({ch.id})</button>
                ))}</div>}
              </div>
            )}
            {c === 'email' && (
              <div className="field"><label>Send to (comma-separated)</label><input value={s.email.to} onChange={(e) => set('email', 'to', e.target.value)} placeholder="owner@gmail.com" /></div>
            )}
            {c === 'whatsapp' && (
              <>
                <div className="field"><label>Send alerts to (number)</label><input value={s.whatsapp.to} onChange={(e) => set('whatsapp', 'to', e.target.value)} placeholder="923224967913" /></div>
                <div className="mrow two" style={{ marginTop: 8 }}>
                  <div className="field"><label>Template name</label><input value={s.whatsapp.template} onChange={(e) => set('whatsapp', 'template', e.target.value)} /></div>
                  <div className="field"><label>Language code</label><input value={s.whatsapp.lang} onChange={(e) => set('whatsapp', 'lang', e.target.value)} /></div>
                </div>
              </>
            )}

            <button type="button" className="btn btn-out" style={{ marginTop: 10 }} disabled={!conf[c] || !!busy} onClick={() => test(c)}>{busy === `test-${c}` ? 'Sending…' : 'Send test'}</button>

            <details className="setup"><summary>How to connect {CH[c].title}</summary>
              <ol>{CH[c].steps.map((t, i) => <li key={i}>{t}</li>)}</ol>
            </details>
          </div>
        ))}
      </div>

      <div className="pnl" style={{ marginTop: 16 }}>
        <label className="chk"><input type="checkbox" checked={s.contactLeads} onChange={(e) => { setS((x) => ({ ...x, contactLeads: e.target.checked })); setDirty(true); }} />
          Also alert when someone taps the WhatsApp or Call button on the website (not just orders)</label>
        <p className="hint" style={{ marginTop: 8, marginBottom: 0 }}>Each alert’s result (sent / failed) is saved in the order’s history under Leads &amp; orders.</p>
      </div>
    </>
  );
}
