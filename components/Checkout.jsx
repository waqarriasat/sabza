'use client';
import { useState } from 'react';
import Link from 'next/link';
import Raw from '@/components/Raw';
import PlantArt from '@/components/PlantArt';
import Logo from '@/components/Logo';
import { ICONS } from '@/lib/icons';
import { fmt } from '@/lib/data';
import { BRAND } from '@/lib/brand';
import { estimate, rsRange } from '@/lib/delivery';
import { useCart, setQty, removeFromCart, clearCart, keyOf } from '@/lib/cart';

const EMPTY_FORM = { name: '', phone: '', email: '', area: '', address: '', notes: '' };

export default function Checkout({ payments, delivery }) {
  const { items, count, subtotal } = useCart();
  const [pay, setPay] = useState(payments[0]?.id || '');
  const [txn, setTxn] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [copied, setCopied] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { id, total, whatsapp, method }
  const hasPlants = items.some((it) => it.plant !== false);
  const [dm, setDm] = useState(() => delivery.methods[0]?.id || '');
  const [loc, setLoc] = useState(null); // { km, how, lat, lng, label } or { km, how: 'area', area }
  const [locBusy, setLocBusy] = useState('');
  const [locErr, setLocErr] = useState('');
  const [city, setCity] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const dmethod = delivery.methods.find((m) => m.id === dm);
  const dmBlocked = dmethod && !dmethod.plants && hasPlants;
  const est = dmethod?.kind === 'local' && loc ? estimate(dmethod, loc.km, delivery.rangePct) : null;
  const ship = !dmethod ? null : dmethod.kind === 'pickup' ? 0 : dmethod.kind === 'courier' ? dmethod.flat : est ? est.low : null;
  const total = subtotal + (ship || 0);
  const deliveryReady = dmethod && !dmBlocked && (dmethod.kind !== 'local' || loc) && (dmethod.kind !== 'courier' || city.trim());

  async function quote(body, kind) {
    setLocBusy(kind); setLocErr('');
    try {
      const res = await fetch('/api/delivery-quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Could not work out the distance.');
      setLoc(j);
    } catch (e) {
      setLocErr(e.message);
    } finally {
      setLocBusy('');
    }
  }
  function useMyLocation() {
    if (!navigator.geolocation) return setLocErr('Your browser cannot share location. Enter your address or pick your area.');
    setLocBusy('gps'); setLocErr('');
    navigator.geolocation.getCurrentPosition(
      (p) => quote({ lat: p.coords.latitude, lng: p.coords.longitude }, 'gps'),
      () => { setLocBusy(''); setLocErr('Location permission was denied. Enter your address or pick your area instead.'); },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }
  function fromAddress() {
    if (!form.address.trim() && !form.area.trim()) return setLocErr('Type your area and full address above first.');
    quote({ address: `${form.address}, ${form.area}` }, 'addr');
  }
  const method = payments.find((p) => p.id === pay);
  const needsTxn = method && method.accounts.length > 0 && method.kind !== 'cod' && method.kind !== 'card';
  const copy = (text) => {
    navigator.clipboard?.writeText(text.replace(/\s+/g, '')).then(() => { setCopied(text); setTimeout(() => setCopied(''), 1500); });
  };

  async function placeOrder() {
    setErr('');
    if (!deliveryReady) {
      setErr(dmBlocked ? 'This delivery method cannot carry live plants — please choose another.' : dmethod?.kind === 'courier' ? 'Please enter your city for courier delivery.' : 'Please set your delivery location so we can calculate the delivery charge.');
      document.getElementById('delivery')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.area.trim() || !form.address.trim()) {
      setErr('Please fill in your name, phone number, area and full address.');
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form, items, payment: { id: pay, txn },
          delivery: { method: dm, lat: loc?.lat, lng: loc?.lng, area: loc?.how === 'area' ? loc.area : '', city },
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Could not place your order.');
      setDone({ ...j, method: method?.name });
      clearCart();
      window.scrollTo({ top: 0 });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const Promo = () => (
    <div className="cpromo"><b>Cash on Delivery</b> across {BRAND.city} · Delivery charged by distance · Courier to all Pakistan for seeds, pots &amp; fertilizer</div>
  );

  if (done) {
    return (
      <div className="pg-checkout">
        <Promo />
        <SlimHeader />
        <div className="wrap"><div className="done">
          <div className="ck"><Raw html={ICONS.check} /></div>
          <h2 className="q">Order received! 🌱</h2>
          <p>Thank you. Your order number is <span className="oid">{done.id}</span>.<br />
            Products {fmt(done.subtotal)} + delivery {done.shipping?.kind === 'pickup' ? '(pickup)' : fmt(done.delivery)} = <b>{fmt(done.total)}</b> · {done.method}</p>
          <p style={{ marginTop: 10 }}>Tap below to send your order to us on WhatsApp so we can confirm it quickly.</p>
          <a className="wa-send" href={done.whatsapp} target="_blank" rel="noopener"><Raw html={ICONS.whatsapp} />Send order on WhatsApp</a>
          <p className="small">Or call us on <a href={`tel:${BRAND.phoneIntl}`}>{BRAND.phone}</a> and quote {done.id}.</p>
          <Link href="/">Back to shop</Link>
        </div></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pg-checkout">
        <Promo />
        <SlimHeader />
        <div className="wrap"><div className="done">
          <div className="ck"><Raw html={ICONS.cart} /></div>
          <h2 className="q">Your cart is empty</h2>
          <p>Browse our plants and tap “+” to add them to your cart.</p>
          <Link href="/shop">Shop plants</Link>
        </div></div>
      </div>
    );
  }

  return (
    <div className="pg-checkout">
      <Promo />
      <SlimHeader />

      <div className="wrap">
        <div className="steps">
          <span className="st on"><span className="n">1</span>Cart</span><span className="line"></span>
          <span className="st on"><span className="n">2</span>Details</span><span className="line"></span>
          <span className="st"><span className="n">3</span>Done</span>
        </div>
        <h1 className="pt q">Checkout</h1>

        <div className="grid">
          <div>
            {/* cart */}
            <div className="blk">
              <h2><span className="b">🛒</span>Your cart ({count})</h2>
              {items.map((c) => {
                const k = keyOf(c);
                return (
                  <div className="citem" key={k}>
                    <div className="im"><PlantArt name={c.a} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="nm">{c.n}</div>
                      {c.v && <div className="va">{c.v}</div>}
                      <div className="bot">
                        <div className="qty">
                          <button onClick={() => setQty(k, c.q - 1)} aria-label="Less">−</button><span>{c.q}</span><button onClick={() => setQty(k, c.q + 1)} aria-label="More">+</button>
                        </div>
                        <button className="rm" onClick={() => removeFromCart(k)}><Raw html={ICONS.trash} />Remove</button>
                      </div>
                    </div>
                    <div className="pr"><div className="now">{fmt(c.p * c.q)}</div><div className="ea">{fmt(c.p)} each</div></div>
                  </div>
                );
              })}
            </div>

            {/* contact */}
            <div className="blk" id="contact" style={{ marginTop: 18 }}>
              <h2><span className="b">1</span>Contact &amp; delivery</h2>
              <div className="frow two">
                <div className="field"><label>Full name *</label><input value={form.name} onChange={set('name')} autoComplete="name" placeholder="e.g. Ahmed Khan" /></div>
                <div className="field"><label>Mobile number *</label><input value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" placeholder="03xx xxxxxxx" /></div>
              </div>
              <div className="frow"><div className="field"><label>Email (optional)</label><input value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@email.com" /></div></div>
              <div className="frow two">
                {dmethod?.kind === 'courier'
                  ? <div className="field"><label>City *</label><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Karachi" /><small className="hint">Courier delivers all over Pakistan.</small></div>
                  : <div className="field"><label>City</label><input value={BRAND.city} readOnly /><small className="hint">Live plants are delivered in {BRAND.city} only.</small></div>}
                <div className="field"><label>Area / Town *</label><input value={form.area} onChange={set('area')} placeholder="e.g. DHA Phase 5" /></div>
              </div>
              <div className="frow"><div className="field"><label>Full address *</label><textarea value={form.address} onChange={set('address')} autoComplete="street-address" placeholder="House #, street, landmark…" /></div></div>
              <div className="frow"><div className="field"><label>Delivery notes (optional)</label><input value={form.notes} onChange={set('notes')} placeholder="Best time to deliver, gate code…" /></div></div>
            </div>

            {/* delivery */}
            <div className="blk" id="delivery" style={{ marginTop: 18 }}>
              <h2><span className="b">2</span>Delivery</h2>
              <p className="dnote">Delivery is charged <b>separately</b> from the product price, by road distance from our nursery.</p>
              <div className="pay">
                {delivery.methods.map((m) => {
                  const blocked = !m.plants && hasPlants;
                  const e = m.kind === 'local' && loc ? estimate(m, loc.km, delivery.rangePct) : null;
                  return (
                    <label key={m.id} className={`pm${dm === m.id ? ' on' : ''}${blocked ? ' dis' : ''}`} onClick={() => !blocked && setDm(m.id)}>
                      <span className="radio"></span>
                      <span className="ic" style={{ background: m.kind === 'courier' ? '#1F4E8C' : m.kind === 'pickup' ? '#C8693A' : '#1E4D2B' }}><Raw html={ICONS[m.kind === 'pickup' ? 'pin' : 'truck']} /></span>
                      <span><b>{m.name}</b><small>{blocked ? 'Not available — your cart has live plants' : m.desc}</small></span>
                      <span className="rec">{m.kind === 'pickup' ? 'No charge' : m.kind === 'courier' ? fmt(m.flat) : e ? rsRange(e) : `Rs ${m.perKm}/km · min ${fmt(m.min)}`}</span>
                    </label>
                  );
                })}
              </div>

              {dmethod?.kind === 'local' && (
                <div className="locbox">
                  <b>Where should we deliver?</b>
                  <div className="locbtns">
                    <button type="button" className="lb pri" onClick={useMyLocation} disabled={!!locBusy}><Raw html={ICONS.pin} />{locBusy === 'gps' ? 'Finding you…' : 'Use my current location'}</button>
                    <button type="button" className="lb" onClick={fromAddress} disabled={!!locBusy}>{locBusy === 'addr' ? 'Looking up…' : 'Calculate from my address'}</button>
                  </div>
                  <div className="field"><label>Or choose your area</label>
                    <select value={loc?.how === 'area' ? loc.area : ''} onChange={(e) => {
                      const a = delivery.areas.find((x) => x.name === e.target.value);
                      setLocErr(''); setLoc(a ? { km: a.km, how: 'area', area: a.name } : null);
                    }}>
                      <option value="">— Select area —</option>
                      {delivery.areas.map((a) => <option key={a.name} value={a.name}>{a.name}</option>)}
                    </select>
                  </div>
                  {locErr && <p className="lerr">{locErr}</p>}
                  {loc && (
                    <p className="lok"><Raw html={ICONS.check} />
                      {loc.how === 'area' ? `${loc.area}: about ${loc.km} km from the nursery` : `${loc.km} km from the nursery${loc.how === 'approx' ? ' (approx.)' : ' by road'}`}
                      {est && <> · {dmethod.name}: <b>{rsRange(est)}</b> <small>({loc.km} km × Rs {dmethod.perKm}{est.low === dmethod.min ? `, minimum ${fmt(dmethod.min)}` : ''})</small></>}
                    </p>
                  )}
                </div>
              )}
              {dmethod?.kind === 'pickup' && (
                <div className="locbox"><b>Pick up from:</b> {BRAND.address}<br /><small>{BRAND.hours} · <a href={BRAND.mapsUrl} target="_blank" rel="noopener">Directions ↗</a> · We'll call you when your order is ready.</small></div>
              )}
              {dmethod?.kind === 'courier' && (
                <div className="locbox"><small>Courier rate {fmt(dmethod.flat)} anywhere in Pakistan. Usually 2–5 working days. Enter your city in the delivery details above.</small></div>
              )}
            </div>

            {/* payment */}
            <div className="blk" style={{ marginTop: 18 }}>
              <h2><span className="b">3</span>Payment method</h2>
              {payments.length === 0 && <p className="pay-none">Online ordering is not available right now. Please contact us on WhatsApp to place your order.</p>}
              <div className="pay">
                {payments.map((p) => (
                  <div key={p.id}>
                    <label className={`pm${pay === p.id ? ' on' : ''}`} onClick={() => setPay(p.id)}>
                      <span className="radio"></span>
                      <span className="ic" style={{ background: p.color }}>{p.kind === 'cod' ? <Raw html={ICONS.truck} /> : p.kind === 'card' ? <Raw html={ICONS.card} /> : p.logo}</span>
                      <span><b>{p.name}</b><small>{p.desc}</small></span>
                      {p.badge && <span className="rec">{p.badge}</span>}
                    </label>
                    {pay === p.id && (p.instructions || p.accounts.length > 0) && (
                      <div className="pay-det">
                        {p.instructions && <p>{p.instructions}</p>}
                        {p.accounts.map((a) => (
                          <div className="acc" key={a.id}>
                            {a.bank && <div className="bk">{a.bank}</div>}
                            {a.title && <div className="row"><span>Account title</span><b>{a.title}</b></div>}
                            {a.number && <div className="row"><span>{p.kind === 'bank' ? 'Account no.' : p.kind === 'raast' ? 'Raast ID' : 'Number'}</span><b>{a.number}</b>
                              <button type="button" onClick={() => copy(a.number)}>{copied === a.number ? 'Copied' : 'Copy'}</button></div>}
                            {a.iban && <div className="row"><span>IBAN</span><b>{a.iban}</b>
                              <button type="button" onClick={() => copy(a.iban)}>{copied === a.iban ? 'Copied' : 'Copy'}</button></div>}
                          </div>
                        ))}
                        {needsTxn && (
                          <div className="field"><label>Transaction ID / reference (optional)</label>
                            <input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="Paste it here after you pay" /></div>
                        )}
                        {p.kind !== 'cod' && p.accounts.length === 0 && p.kind !== 'card' && (
                          <p>We'll send you the account details on WhatsApp after you place the order.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* summary */}
          <div className="blk sum">
            <h2><span className="b">📋</span>Order summary</h2>
            <div className="line"><span>Products</span><span>{fmt(subtotal)}</span></div>
            <div className="line"><span>Delivery{dmethod ? ` · ${dmethod.name}` : ''}</span>
              <span>{ship === null ? <small className="muted">set location</small> : dmethod?.kind === 'pickup' ? 'No charge' : est && est.high > est.low ? rsRange(est) : fmt(ship)}</span></div>
            <div className="line tot"><span>Total</span><span>{fmt(total)}</span></div>
            <div className="ship-note">{dmethod?.kind === 'local'
              ? (loc ? `Delivery ${loc.km} km × Rs ${dmethod.perKm}/km (min ${fmt(dmethod.min)}). Pay the delivery charge with your order.` : 'Set your delivery location to see the delivery charge.')
              : dmethod?.kind === 'courier' ? 'Courier charge is a flat rate.' : 'Collect from the nursery — no delivery charge.'}</div>
            {err && <div className="err" role="alert">{err}</div>}
            <button className="place" disabled={!method || busy || !items.length} onClick={placeOrder}>
              <Raw html={ICONS.check} />{busy ? 'Placing order…' : 'Place order'}
            </button>
            <div className="trust">
              <div><Raw html={ICONS.star} />Rated {BRAND.googleRating}★ on Google</div>
              <div><Raw html={ICONS.truck} />Carefully packed · bike, rickshaw or loader</div>
              <div><Raw html={ICONS.check} />No account needed to order</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlimHeader() {
  return (
    <div className="top"><div className="wrap"><div className="row">
      <Link className="brand" href="/"><Logo light /></Link>
      <span className="secure"><Raw html={ICONS.shieldCheck} />Secure checkout</span>
    </div></div></div>
  );
}
