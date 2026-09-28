'use client';
import { useState } from 'react';
import Raw from '@/components/Raw';
import { ICONS } from '@/lib/icons';
import { PAYMENT_KINDS, PK_BANKS, DEFAULT_PAYMENTS } from '@/lib/payments';

const uid = () => Math.random().toString(36).slice(2, 10);
const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
const DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const SWAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>';

const EMPTY_METHOD = { id: '', kind: 'wallet', name: '', desc: '', badge: '', color: '#5DA13B', logo: '', enabled: true, instructions: '', accounts: [] };
const EMPTY_ACC = { id: '', bank: '', title: '', number: '', iban: '', active: true };

function Switch({ on, onClick, title }) {
  return <button type="button" className={`sw${on ? ' on' : ''}`} onClick={onClick} title={title} aria-pressed={on}><span /></button>;
}

export default function PaymentsManager({ initial, notify }) {
  const [list, setList] = useState(initial);
  const [open, setOpen] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [mEdit, setMEdit] = useState(null); // { data, isNew }
  const [aEdit, setAEdit] = useState(null); // { methodId, data, mode: 'add'|'edit'|'replace' }

  // Every change is saved straight to the server; on failure the old list comes back.
  async function commit(next, msg) {
    const prev = list;
    setList(next); setSaving(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payments: next }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Could not save.');
      setList(j.payments);
      notify(msg || 'Saved');
      return true;
    } catch (e) {
      setList(prev);
      notify(e.message, true);
      return false;
    } finally {
      setSaving(false);
    }
  }

  const update = (id, fn, msg) => commit(list.map((p) => (p.id === id ? fn(p) : p)), msg);
  const toggleOpen = (id) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next, 'Order updated');
  };
  const removeMethod = (p) => {
    if (!confirm(`Remove "${p.name}" and all its accounts? Customers will no longer see it.`)) return;
    commit(list.filter((x) => x.id !== p.id), `${p.name} removed`);
  };
  const resetAll = () => {
    if (!confirm('Reset all payment methods to the defaults? Every account you added will be deleted.')) return;
    commit(DEFAULT_PAYMENTS, 'Payment methods reset');
  };

  async function saveMethod(e) {
    e.preventDefault();
    const d = mEdit.data;
    const ok = mEdit.isNew
      ? await commit([...list, { ...d, id: d.id || uid() }], `${d.name} added`)
      : await update(d.id, () => d, `${d.name} updated`);
    if (ok) setMEdit(null);
  }

  async function saveAccount(e) {
    e.preventDefault();
    const { methodId, data, mode } = aEdit;
    const ok = await update(methodId, (p) => ({
      ...p,
      accounts: mode === 'add'
        ? [...p.accounts, { ...data, id: uid() }]
        : p.accounts.map((a) => (a.id === data.id ? data : a)),
    }), mode === 'add' ? 'Account added' : mode === 'replace' ? 'Account replaced' : 'Account updated');
    if (ok) {
      setAEdit(null);
      setOpen((s) => new Set(s).add(methodId));
    }
  }

  const removeAccount = (p, a) => {
    if (!confirm(`Remove account ${a.title || a.number} from ${p.name}?`)) return;
    update(p.id, (x) => ({ ...x, accounts: x.accounts.filter((y) => y.id !== a.id) }), 'Account removed');
  };
  const onlyThis = (p, a) =>
    update(p.id, (x) => ({ ...x, accounts: x.accounts.map((y) => ({ ...y, active: y.id === a.id })) }), `Only ${a.title || a.number} is shown now`);

  const setM = (k, v) => setMEdit((m) => ({ ...m, data: { ...m.data, [k]: v } }));
  const setA = (k, v) => setAEdit((m) => ({ ...m, data: { ...m.data, [k]: v } }));
  const aMethod = aEdit && list.find((p) => p.id === aEdit.methodId);
  const aKind = aMethod ? aMethod.kind : 'other';

  const enabledCount = list.filter((p) => p.enabled).length;

  return (
    <>
      <div className="ptools">
        <div className="pinfo">
          <b>{enabledCount}</b> of {list.length} methods shown at checkout
          {saving && <span className="saving">Saving…</span>}
        </div>
        <button className="btn btn-out" onClick={resetAll}>Reset to defaults</button>
        <button className="btn btn-pri" onClick={() => setMEdit({ data: { ...EMPTY_METHOD }, isNew: true })}><Raw html={ICONS.plus} />Add payment method</button>
      </div>

      {list.length === 0 && (
        <div className="pnl"><div className="ph-soon"><Raw html={ICONS.card} />No payment methods. Add one so customers can pay.</div></div>
      )}

      <div className="pm-list">
        {list.map((p, i) => {
          const kind = PAYMENT_KINDS[p.kind] || PAYMENT_KINDS.other;
          const activeAcc = p.accounts.filter((a) => a.active).length;
          const isOpen = open.has(p.id);
          const warn = p.enabled && kind.needsAccount && activeAcc === 0;
          return (
            <div className={`pnl pm-card${p.enabled ? '' : ' off'}`} key={p.id}>
              <div className="pm-head">
                <div className="pm-order">
                  <button title="Move up" disabled={i === 0} onClick={() => move(i, -1)}><Raw html={UP} /></button>
                  <button title="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}><Raw html={DOWN} /></button>
                </div>
                <span className="pm-logo" style={{ background: p.color }}>{p.logo}</span>
                <div className="pm-name" onClick={() => toggleOpen(p.id)}>
                  <b>{p.name}</b>{p.badge && <span className="badge b-green">{p.badge}</span>}
                  <small>{kind.label} · {kind.needsAccount || p.accounts.length ? `${activeAcc} active of ${p.accounts.length} account${p.accounts.length === 1 ? '' : 's'}` : p.desc}</small>
                  {warn && <small className="warn">No active account — customers won't see where to pay.</small>}
                </div>
                <div className="pm-sw">
                  <span>{p.enabled ? 'Shown' : 'Hidden'}</span>
                  <Switch on={p.enabled} title={p.enabled ? 'Hide at checkout' : 'Show at checkout'}
                    onClick={() => update(p.id, (x) => ({ ...x, enabled: !x.enabled }), `${p.name} ${p.enabled ? 'hidden' : 'shown'} at checkout`)} />
                </div>
                <div className="act">
                  <button title="Accounts" onClick={() => toggleOpen(p.id)}><Raw html={isOpen ? UP : DOWN} /></button>
                  <button title="Edit method" onClick={() => setMEdit({ data: { ...p }, isNew: false })}><Raw html={ICONS.edit} /></button>
                  <button className="del" title="Remove method" onClick={() => removeMethod(p)}><Raw html={ICONS.trash} /></button>
                </div>
              </div>

              {isOpen && (
                <div className="pm-body">
                  {p.instructions && <p className="pm-ins">{p.instructions}</p>}
                  {p.accounts.length > 0 ? (
                    <div className="tbl-wrap"><table>
                      <thead><tr>{p.kind === 'bank' && <th>Bank</th>}<th>Account title</th><th>{kind.numberLabel || 'Number'}</th><th>IBAN</th><th>Shown</th><th>Actions</th></tr></thead>
                      <tbody>
                        {p.accounts.map((a) => (
                          <tr key={a.id}>
                            {p.kind === 'bank' && <td>{a.bank || '—'}</td>}
                            <td><b>{a.title || '—'}</b></td>
                            <td className="mono">{a.number || '—'}</td>
                            <td className="mono">{a.iban || '—'}</td>
                            <td><Switch on={a.active} title={a.active ? 'Hide this account' : 'Show this account'}
                              onClick={() => update(p.id, (x) => ({ ...x, accounts: x.accounts.map((y) => (y.id === a.id ? { ...y, active: !y.active } : y)) }), a.active ? 'Account hidden' : 'Account shown')} /></td>
                            <td><div className="act">
                              <button title="Edit account" onClick={() => setAEdit({ methodId: p.id, data: { ...a }, mode: 'edit' })}><Raw html={ICONS.edit} /></button>
                              <button title="Replace with a new account" onClick={() => setAEdit({ methodId: p.id, data: { ...EMPTY_ACC, id: a.id, bank: a.bank, active: a.active }, mode: 'replace', old: a })}><Raw html={SWAP} /></button>
                              {p.accounts.length > 1 && <button title="Show only this account" onClick={() => onlyThis(p, a)}><Raw html={ICONS.check} /></button>}
                              <button className="del" title="Remove account" onClick={() => removeAccount(p, a)}><Raw html={ICONS.trash} /></button>
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table></div>
                  ) : (
                    <p className="pm-empty">{kind.needsAccount ? 'No accounts yet. Add the account customers should send money to.' : 'This method does not need an account. You can still add one (e.g. a gateway/merchant ID).'}</p>
                  )}
                  <button className="btn btn-out" onClick={() => setAEdit({ methodId: p.id, data: { ...EMPTY_ACC, bank: p.kind === 'bank' ? PK_BANKS[0] : '' }, mode: 'add' })}>
                    <Raw html={ICONS.plus} />Add account
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* method modal */}
      {mEdit && (
        <div className="ov show" onMouseDown={(e) => { if (e.target === e.currentTarget) setMEdit(null); }}>
          <form className="modal" onSubmit={saveMethod}>
            <h3 className="q">{mEdit.isNew ? 'Add payment method' : `Edit ${mEdit.data.name}`}<button type="button" onClick={() => setMEdit(null)}><Raw html={ICONS.close} /></button></h3>
            <div className="sub">How this method appears to customers at checkout.</div>
            <div className="mrow two">
              <div className="field"><label>Name</label><input required maxLength={60} value={mEdit.data.name} onChange={(e) => setM('name', e.target.value)} placeholder="e.g. JazzCash" /></div>
              <div className="field"><label>Type</label>
                <select value={mEdit.data.kind} onChange={(e) => setM('kind', e.target.value)}>
                  {Object.entries(PAYMENT_KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mrow"><div className="field"><label>Short description</label><input maxLength={140} value={mEdit.data.desc} onChange={(e) => setM('desc', e.target.value)} placeholder="Shown under the name" /></div></div>
            <div className="mrow two">
              <div className="field"><label>Badge (optional)</label><input maxLength={30} value={mEdit.data.badge} onChange={(e) => setM('badge', e.target.value)} placeholder="e.g. Most popular" /></div>
              <div className="field"><label>Logo text &amp; colour</label>
                <div className="logo-row">
                  <input maxLength={5} value={mEdit.data.logo} onChange={(e) => setM('logo', e.target.value)} placeholder="JC" />
                  <input type="color" value={mEdit.data.color} onChange={(e) => setM('color', e.target.value)} />
                  <span className="pm-logo" style={{ background: mEdit.data.color }}>{mEdit.data.logo || (mEdit.data.name || '?').slice(0, 2).toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="mrow"><div className="field"><label>Instructions for the customer</label><textarea rows={3} maxLength={600} value={mEdit.data.instructions} onChange={(e) => setM('instructions', e.target.value)} placeholder="e.g. Send the total to the account below and enter the transaction ID." /></div></div>
            <label className="chk"><input type="checkbox" checked={mEdit.data.enabled} onChange={(e) => setM('enabled', e.target.checked)} /> Show at checkout</label>
            <div className="mfoot">
              <button type="button" className="btn btn-out" onClick={() => setMEdit(null)}>Cancel</button>
              <button className="btn btn-pri" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      {/* account modal */}
      {aEdit && (
        <div className="ov show" onMouseDown={(e) => { if (e.target === e.currentTarget) setAEdit(null); }}>
          <form className="modal" onSubmit={saveAccount}>
            <h3 className="q">{aEdit.mode === 'add' ? 'Add account' : aEdit.mode === 'replace' ? 'Replace account' : 'Edit account'} — {aMethod?.name}
              <button type="button" onClick={() => setAEdit(null)}><Raw html={ICONS.close} /></button></h3>
            <div className="sub">
              {aEdit.mode === 'replace'
                ? <>Enter the new account. It replaces <b>{aEdit.old.title || aEdit.old.number}</b> ({aEdit.old.number}) everywhere on the site.</>
                : 'Customers see these details at checkout when they pick this method.'}
            </div>
            {aKind === 'bank' && (
              <div className="mrow"><div className="field"><label>Bank</label>
                <select value={PK_BANKS.includes(aEdit.data.bank) ? aEdit.data.bank : 'Other'} onChange={(e) => setA('bank', e.target.value === 'Other' ? '' : e.target.value)}>
                  {PK_BANKS.map((b) => <option key={b}>{b}</option>)}
                </select>
                {!PK_BANKS.includes(aEdit.data.bank) && <input style={{ marginTop: 8 }} value={aEdit.data.bank} onChange={(e) => setA('bank', e.target.value)} placeholder="Bank name" />}
              </div></div>
            )}
            <div className="mrow two">
              <div className="field"><label>Account title (name)</label><input required maxLength={80} value={aEdit.data.title} onChange={(e) => setA('title', e.target.value)} placeholder="e.g. Waqar Riasat" /></div>
              <div className="field"><label>{(PAYMENT_KINDS[aKind] || PAYMENT_KINDS.other).numberLabel || 'Account / reference number'}</label>
                <input required={aKind !== 'raast' && aKind !== 'card'} maxLength={40} value={aEdit.data.number} onChange={(e) => setA('number', e.target.value)} placeholder={aKind === 'wallet' || aKind === 'raast' ? '03xx xxxxxxx' : ''} /></div>
            </div>
            {(aKind === 'bank' || aKind === 'raast' || aKind === 'other') && (
              <div className="mrow"><div className="field"><label>IBAN {aKind === 'bank' ? '' : '(optional)'}</label><input maxLength={40} value={aEdit.data.iban} onChange={(e) => setA('iban', e.target.value)} placeholder="PK36 SCBL 0000 0011 2345 6702" /></div></div>
            )}
            <label className="chk"><input type="checkbox" checked={aEdit.data.active} onChange={(e) => setA('active', e.target.checked)} /> Show this account at checkout</label>
            <div className="mfoot">
              <button type="button" className="btn btn-out" onClick={() => setAEdit(null)}>Cancel</button>
              <button className="btn btn-pri" disabled={saving}>{saving ? 'Saving…' : aEdit.mode === 'replace' ? 'Replace account' : 'Save account'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
