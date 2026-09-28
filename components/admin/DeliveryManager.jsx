'use client';
import { useEffect, useState } from 'react';
import Raw from '@/components/Raw';
import { ICONS } from '@/lib/icons';
import { estimate, rsRange, parseLatLng } from '@/lib/delivery';

const KIND_LABEL = { local: 'Local (fare estimate)', pickup: 'Pickup', courier: 'Courier (flat rate)' };

export default function DeliveryManager({ notify }) {
  const [d, setD] = useState(null);
  const [check, setCheck] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(12);
  const [pin, setPin] = useState('');

  useEffect(() => {
    fetch('/api/admin/delivery', { cache: 'no-store' }).then((r) => r.json()).then((j) => {
      if (j.error) throw new Error(j.error);
      setD(j.delivery); setCheck(j.check || []);
    }).catch((e) => notify(e.message, true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const upd = (fn) => { setD((x) => fn(structuredClone(x))); setDirty(true); };
  const setM = (i, k, v) => upd((x) => { x.methods[i][k] = v; return x; });
  const setA = (i, k, v) => upd((x) => { x.areas[i][k] = v; return x; });

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/delivery', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delivery: d }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Could not save.');
      setD(j.delivery); setCheck(j.check || []); setDirty(false); notify('Delivery settings saved');
    } catch (e) { notify(e.message, true); } finally { setSaving(false); }
  }

  if (!d) return <div className="pnl"><div className="ph-soon">Loading…</div></div>;

  return (
    <>
      <div className="ptools">
        <div className="pinfo">Customers pay the <b>order price</b> at checkout and the <b>actual delivery fare</b> separately. Local fares are shown as an estimate.</div>
        <button className="btn btn-pri" disabled={!dirty || saving} onClick={save}>{saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</button>
      </div>

      <div className="pnl">
        <div className="ph"><h3>Delivery methods</h3></div>
        <div className="tbl-wrap"><table className="dtable">
          <thead><tr><th>On</th><th>Name &amp; description</th><th>Type</th><th>Rate per km</th><th>Minimum fare</th><th>Courier rate</th><th>Live plants?</th><th>Example ({preview} km)</th></tr></thead>
          <tbody>
            {d.methods.map((m, i) => (
              <tr key={m.id} className={m.enabled ? '' : 'off'}>
                <td><button type="button" className={`sw${m.enabled ? ' on' : ''}`} onClick={() => setM(i, 'enabled', !m.enabled)}><span /></button></td>
                <td style={{ minWidth: 220 }}><input value={m.name} onChange={(e) => setM(i, 'name', e.target.value)} /><input className="sub" value={m.desc} onChange={(e) => setM(i, 'desc', e.target.value)} /></td>
                <td><small className="sm">{KIND_LABEL[m.kind]}</small></td>
                <td>{m.kind === 'local' ? <span className="rsin">Rs<input type="number" min="0" value={m.perKm} onChange={(e) => setM(i, 'perKm', e.target.value)} />/km</span> : '—'}</td>
                <td>{m.kind === 'local' ? <span className="rsin">Rs<input type="number" min="0" value={m.min} onChange={(e) => setM(i, 'min', e.target.value)} /></span> : '—'}</td>
                <td>{m.kind === 'courier' ? <span className="rsin">Rs<input type="number" min="0" value={m.flat} onChange={(e) => setM(i, 'flat', e.target.value)} /></span> : '—'}</td>
                <td><button type="button" className={`sw${m.plants ? ' on' : ''}`} onClick={() => setM(i, 'plants', !m.plants)} title="Can this method carry live plants?"><span /></button></td>
                <td style={{ whiteSpace: 'nowrap' }}>{m.kind === 'local' ? rsRange(estimate({ ...m, min: +m.min, perKm: +m.perKm }, preview, +d.rangePct)) : m.kind === 'courier' ? `Rs ${(+m.flat).toLocaleString()}` : 'Free'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <div className="drow">
          <label>Show a price range (optional): <span className="rsin">+<input type="number" min="0" max="200" value={d.rangePct} onChange={(e) => upd((x) => { x.rangePct = e.target.value; return x; })} />%</span></label>
          <label>Preview distance: <span className="rsin"><input type="number" min="0" value={preview} onChange={(e) => setPreview(+e.target.value || 0)} />km</span></label>
        </div>
      </div>

      <div className="pnl" style={{ marginTop: 16 }}>
        <div className="ph"><h3>Nursery location (distance is measured from here)</h3></div>
        <p className="hint">Open the nursery in Google Maps, tap <b>Share → Copy link</b> (or long-press the pin to copy its coordinates) and paste it here.
          Current: <b>{(+d.origin.lat).toFixed(5)}, {(+d.origin.lng).toFixed(5)}</b> ·{' '}
          <a href={`https://www.google.com/maps?q=${d.origin.lat},${d.origin.lng}`} target="_blank" rel="noopener">check on map ↗</a></p>
        <div className="arow" style={{ maxWidth: 640 }}>
          <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Paste Google Maps link or coordinates, e.g. 31.4450, 74.3540" />
          <button type="button" className="btn btn-out" onClick={() => {
            const p = parseLatLng(pin);
            if (!p) return notify('No coordinates found. Use the full link from the browser address bar, or copy the pin coordinates.', true);
            upd((x) => { x.origin = { ...x.origin, lat: p.lat, lng: p.lng }; return x; }); setPin(''); notify('Location updated — press Save changes');
          }}>Use this location</button>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>Short links (maps.app.goo.gl) don't contain coordinates — open them first, then copy the long link from the address bar.</p>
      </div>

      <div className="panels" style={{ marginTop: 16 }}>
        <div className="pnl">
          <div className="ph"><h3>Lahore areas &amp; distance from nursery</h3>
            <a onClick={() => upd((x) => { x.areas.push({ name: '', km: 10 }); return x; })}>+ Add area</a></div>
          <p className="hint">Backup for when an address can't be found on the map: the customer picks their area and this distance is used.</p>
          <div className="areas">
            {d.areas.map((a, i) => (
              <div className="arow" key={i}>
                <input value={a.name} placeholder="Area name" onChange={(e) => setA(i, 'name', e.target.value)} />
                <span className="rsin"><input type="number" min="0" value={a.km} onChange={(e) => setA(i, 'km', e.target.value)} />km</span>
                <button type="button" className="x" title="Remove area" onClick={() => upd((x) => { x.areas.splice(i, 1); return x; })}><Raw html={ICONS.trash} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="pnl">
          <div className="ph"><h3>Are the estimates right?</h3></div>
          <p className="hint">Enter the <b>actual fare</b> on each order (Leads &amp; orders → order details). This compares real fares with the estimates so you can adjust the rates above.</p>
          {check.map((c) => (
            <div className="fcheck" key={c.id}>
              <b>{c.name}</b>
              {c.count === 0 ? <small>No actual fares recorded yet</small> : (
                <small>Last {c.count}: actual avg Rs {c.actual.toLocaleString()} vs estimate Rs {c.estimate.toLocaleString()} —{' '}
                  <b className={Math.abs(c.diffPct) <= 10 ? 'ok' : 'bad'}>{c.diffPct > 0 ? `${c.diffPct}% higher` : c.diffPct < 0 ? `${-c.diffPct}% lower` : 'spot on'}</b>
                  {Math.abs(c.diffPct) > 10 && ` → consider ${c.diffPct > 0 ? 'raising' : 'lowering'} the rates`}</small>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
