'use client';
import { useEffect, useMemo, useState } from 'react';
import Raw from '@/components/Raw';
import { ICONS } from '@/lib/icons';
import { LEAD_STATUSES, SALE_STATUSES, saleValue, commissionOf, monthOf, pkTime } from '@/lib/leads-shared';

const TYPE = { order: { label: 'Order', cls: 'b-green' }, whatsapp: { label: 'WhatsApp', cls: 'b-blue' }, call: { label: 'Call', cls: 'b-purple' } };
const ST_CLS = { new: 'b-orange', contacted: 'b-blue', confirmed: 'b-green', delivered: 'b-green', cancelled: 'b-grey', spam: 'b-red' };
const rs = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;
const monthLabel = (m) => new Date(`${m}-01T12:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export default function LeadsManager({ notify }) {
  const [leads, setLeads] = useState(null);
  const [commission, setCommission] = useState({ rate: 0, basis: 'subtotal' });
  const [month, setMonth] = useState(() => monthOf(new Date().toISOString()));
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [rateEdit, setRateEdit] = useState(null);
  const [note, setNote] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/admin/leads', { cache: 'no-store' });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Could not load leads.');
      setLeads(j.leads); setCommission(j.commission);
    } catch (e) {
      notify(e.message, true); setLeads([]);
    }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function patch(id, changes, msg) {
    try {
      const res = await fetch('/api/admin/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...changes }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Could not save.');
      setLeads((ls) => ls.map((l) => (l.id === id ? j.lead : l)));
      if (open?.id === id) setOpen(j.lead);
      notify(msg || `${id} updated`);
      return true;
    } catch (e) {
      notify(e.message, true);
      return false;
    }
  }

  async function saveRate() {
    try {
      const res = await fetch('/api/admin/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rateEdit) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Could not save.');
      setCommission(j.commission); setRateEdit(null); notify('Commission rate saved');
    } catch (e) { notify(e.message, true); }
  }

  const months = useMemo(() => {
    const set = new Set([monthOf(new Date().toISOString()), ...(leads || []).map((l) => monthOf(l.createdAt))]);
    return [...set].sort().reverse();
  }, [leads]);

  const inMonth = useMemo(() => (leads || []).filter((l) => month === 'all' || monthOf(l.createdAt) === month), [leads, month]);
  const shown = inMonth.filter((l) => {
    if (type !== 'all' && l.type !== type) return false;
    if (status !== 'all' && l.status !== status) return false;
    if (q) {
      const s = `${l.id} ${l.customer.name} ${l.customer.phone} ${l.customer.area} ${l.note} ${l.source?.label}`.toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const stats = useMemo(() => {
    const sales = inMonth.filter((l) => SALE_STATUSES.includes(l.status));
    return {
      leads: inMonth.length,
      orders: inMonth.filter((l) => l.type === 'order').length,
      contacts: inMonth.filter((l) => l.type !== 'order').length,
      salesCount: sales.length,
      salesValue: sales.reduce((s, l) => s + saleValue(l, commission), 0),
      commission: sales.reduce((s, l) => s + commissionOf(l, commission), 0),
    };
  }, [inMonth, commission]);

  if (leads === null) return <div className="pnl"><div className="ph-soon">Loading leads…</div></div>;

  return (
    <>
      <div className="ptools">
        <select className="sel" value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          <option value="all">All time</option>
        </select>
        <div className="tsearch"><Raw html={ICONS.search} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, name, phone, area…" /></div>
        <button className="btn btn-out" onClick={load}>Refresh</button>
        <a className="btn btn-out" href={`/api/admin/leads/export?month=${month === 'all' ? '' : month}`}><Raw html={ICONS.exportData} />Export CSV</a>
      </div>

      <div className="stats">
        <div className="scard"><div className="lbl">Website leads</div><div className="val">{stats.leads}</div><div className="tr">{stats.orders} orders · {stats.contacts} WhatsApp/calls</div></div>
        <div className="scard"><div className="lbl">Confirmed sales</div><div className="val">{stats.salesCount}</div><div className="tr">Confirmed or delivered</div></div>
        <div className="scard"><div className="lbl">Sales value</div><div className="val">{rs(stats.salesValue)}</div><div className="tr">{commission.basis === 'total' ? 'Incl. delivery' : 'Excl. delivery'}</div></div>
        <div className="scard"><div className="lbl">Commission ({commission.rate}%)</div><div className="val">{rs(stats.commission)}</div>
          <div className="tr"><a onClick={() => setRateEdit({ rate: commission.rate, basis: commission.basis })} style={{ cursor: 'pointer' }}>Change rate</a></div></div>
      </div>

      {commission.rate === 0 && (
        <div className="alert">Commission rate is not set yet. <a onClick={() => setRateEdit({ rate: '', basis: 'subtotal' })} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Set the agreed %</a></div>
      )}

      <div className="chips-row">
        {['all', 'order', 'whatsapp', 'call'].map((t) => (
          <button key={t} className={`chip${type === t ? ' on' : ''}`} onClick={() => setType(t)}>{t === 'all' ? 'All' : TYPE[t].label}</button>
        ))}
        <select className="sel" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Any status</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="pnl"><div className="tbl-wrap">
        {shown.length === 0 ? (
          <div className="ph-soon"><Raw html={ICONS.orders} />No leads {month === 'all' ? 'yet' : `in ${monthLabel(month)}`}{type !== 'all' || status !== 'all' || q ? ' matching these filters' : ''}.</div>
        ) : (
          <table>
            <thead><tr><th>Ref</th><th>Date</th><th>Type</th><th>Customer</th><th>Source</th><th>Order</th><th>Status</th><th>Sale (Rs)</th><th>Comm.</th><th></th></tr></thead>
            <tbody>
              {shown.map((l) => (
                <tr key={l.id}>
                  <td><b>{l.id}</b></td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--muted)' }}>{pkTime(l.createdAt)}</td>
                  <td><span className={`badge ${TYPE[l.type]?.cls}`}>{TYPE[l.type]?.label || l.type}</span></td>
                  <td>{l.customer.name ? <><b>{l.customer.name}</b><small className="sm">{l.customer.phone}{l.customer.area ? ` · ${l.customer.area}` : ''}</small></> : <small className="sm">{l.note || '—'}</small>}</td>
                  <td><small className="sm">{l.source?.label || 'direct'}</small></td>
                  <td>{l.total ? rs(l.total) : '—'}</td>
                  <td>
                    <select className={`stsel ${ST_CLS[l.status]}`} value={l.status} onChange={(e) => patch(l.id, { status: e.target.value }, `${l.id} → ${e.target.value}`)}>
                      {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <input className="amt" type="number" min="0" key={`${l.id}-${l.saleAmount}`} defaultValue={l.saleAmount ?? ''}
                      placeholder={l.type === 'order' ? String(commission.basis === 'total' ? l.total : l.subtotal) : 'amount'}
                      onBlur={(e) => { const v = e.target.value; if (String(v) !== String(l.saleAmount ?? '')) patch(l.id, { saleAmount: v }, `${l.id} sale amount saved`); }} />
                  </td>
                  <td>{SALE_STATUSES.includes(l.status) ? rs(commissionOf(l, commission)) : '—'}</td>
                  <td><div className="act"><button title="Details & history" onClick={() => { setOpen(l); setNote(''); }}><Raw html={ICONS.eye} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div></div>
      <p className="hint" style={{ marginTop: 12 }}>
        Leads are saved automatically and can’t be deleted. Mark a lead <b>confirmed</b> or <b>delivered</b> when it becomes a sale — only those count toward commission.
        For WhatsApp and call leads, enter the sale amount once the customer buys. Every change is recorded in the lead’s history.
      </p>

      {/* details */}
      {open && (
        <div className="ov show" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="modal wide">
            <h3 className="q">{open.id} · {TYPE[open.type]?.label}<button type="button" onClick={() => setOpen(null)}><Raw html={ICONS.close} /></button></h3>
            <div className="sub">{pkTime(open.createdAt)} · from <b>{open.source?.label || 'direct'}</b>{open.page ? ` · page ${open.page}` : ''}</div>
            <div className="kv">
              {open.customer.name && <><span>Customer</span><b>{open.customer.name}</b></>}
              {open.customer.phone && <><span>Phone</span><b><a href={`https://wa.me/92${open.customer.phone.replace(/^0/, '')}`} target="_blank" rel="noopener">{open.customer.phone}</a></b></>}
              {open.customer.email && <><span>Email</span><b>{open.customer.email}</b></>}
              {open.customer.area && <><span>Address</span><b>{open.customer.address}, {open.customer.area}</b></>}
              {open.customer.notes && <><span>Notes</span><b>{open.customer.notes}</b></>}
              {open.payment && <><span>Payment</span><b>{open.payment.name}{open.payment.txn ? ` · TID ${open.payment.txn}` : ''}</b></>}
              {open.note && <><span>Info</span><b>{open.note}</b></>}
              {(open.source?.referrer || open.source?.utm_campaign || open.source?.landing) && <><span>Came from</span><b>{[open.source.referrer, open.source.utm_medium, open.source.utm_campaign, open.source.landing].filter(Boolean).join(' · ')}</b></>}
            </div>
            {open.items.length > 0 && (
              <table className="mini">
                <tbody>
                  {open.items.map((it, i) => <tr key={i}><td>{it.n}{it.v ? <small className="sm">{it.v}</small> : null}</td><td>×{it.q}</td><td style={{ textAlign: 'right' }}>{rs(it.p * it.q)}</td></tr>)}
                  <tr><td>Delivery</td><td></td><td style={{ textAlign: 'right' }}>{open.delivery ? rs(open.delivery) : 'FREE'}</td></tr>
                  <tr><td><b>Total</b></td><td></td><td style={{ textAlign: 'right' }}><b>{rs(open.total)}</b></td></tr>
                </tbody>
              </table>
            )}
            <h4 className="hh">History</h4>
            <ul className="hist">
              {open.history.map((h, i) => (
                <li key={i}><small>{pkTime(h.at)} · {h.by}</small>
                  {h.action === 'created' ? 'Lead created' : h.action === 'note' ? `Note: ${h.to}` : `${h.action}: ${h.from ?? '—'} → ${h.to ?? '—'}`}</li>
              ))}
            </ul>
            <div className="mrow"><div className="field"><label>Add a note</label><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Customer confirmed on call, delivering Friday" /></div></div>
            <div className="mfoot">
              <button className="btn btn-out" onClick={() => setOpen(null)}>Close</button>
              <button className="btn btn-pri" disabled={!note.trim()} onClick={async () => { if (await patch(open.id, { note }, 'Note added')) setNote(''); }}>Add note</button>
            </div>
          </div>
        </div>
      )}

      {/* commission rate */}
      {rateEdit && (
        <div className="ov show" onMouseDown={(e) => { if (e.target === e.currentTarget) setRateEdit(null); }}>
          <div className="modal">
            <h3 className="q">Commission rate<button type="button" onClick={() => setRateEdit(null)}><Raw html={ICONS.close} /></button></h3>
            <div className="sub">Applied to confirmed and delivered sales. Changes are logged.</div>
            <div className="mrow two">
              <div className="field"><label>Rate (%)</label><input type="number" min="0" max="100" step="0.5" value={rateEdit.rate} onChange={(e) => setRateEdit((r) => ({ ...r, rate: e.target.value }))} /></div>
              <div className="field"><label>Calculated on</label>
                <select value={rateEdit.basis} onChange={(e) => setRateEdit((r) => ({ ...r, basis: e.target.value }))}>
                  <option value="subtotal">Products only (excl. delivery)</option>
                  <option value="total">Order total (incl. delivery)</option>
                </select></div>
            </div>
            <div className="mfoot">
              <button className="btn btn-out" onClick={() => setRateEdit(null)}>Cancel</button>
              <button className="btn btn-pri" onClick={saveRate}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
