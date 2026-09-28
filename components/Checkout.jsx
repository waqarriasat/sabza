'use client';
import { useState } from 'react';
import Link from 'next/link';
import Raw from '@/components/Raw';
import PlantArt from '@/components/PlantArt';
import Logo from '@/components/Logo';
import { ICONS } from '@/lib/icons';
import { fmt } from '@/lib/data';
import { BRAND, DELIVERY } from '@/lib/brand';
import { useCart, setQty, removeFromCart, clearCart, keyOf } from '@/lib/cart';

const EMPTY_FORM = { name: '', phone: '', email: '', area: '', address: '', notes: '' };

export default function Checkout({ payments }) {
  const { items, count, subtotal } = useCart();
  const [pay, setPay] = useState(payments[0]?.id || '');
  const [txn, setTxn] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [copied, setCopied] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { id, total, whatsapp, method }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const ship = subtotal >= DELIVERY.freeOver ? 0 : DELIVERY.fee;
  const total = subtotal + ship;
  const method = payments.find((p) => p.id === pay);
  const needsTxn = method && method.accounts.length > 0 && method.kind !== 'cod' && method.kind !== 'card';
  const copy = (text) => {
    navigator.clipboard?.writeText(text.replace(/\s+/g, '')).then(() => { setCopied(text); setTimeout(() => setCopied(''), 1500); });
  };

  async function placeOrder() {
    setErr('');
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
        body: JSON.stringify({ customer: form, items, payment: { id: pay, txn } }),
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
    <div className="cpromo"><b>Cash on Delivery</b> across {BRAND.city} · Free delivery over Rs {DELIVERY.freeOver.toLocaleString()}</div>
  );

  if (done) {
    return (
      <div className="pg-checkout">
        <Promo />
        <SlimHeader />
        <div className="wrap"><div className="done">
          <div className="ck"><Raw html={ICONS.check} /></div>
          <h2 className="q">Order received! 🌱</h2>
          <p>Thank you. Your order number is <span className="oid">{done.id}</span>.<br />Total {fmt(done.total)} · {done.method}</p>
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
                <div className="field"><label>City</label><input value={BRAND.city} readOnly /><small className="hint">{DELIVERY.areaNote}</small></div>
                <div className="field"><label>Area / Town *</label><input value={form.area} onChange={set('area')} placeholder="e.g. DHA Phase 5" /></div>
              </div>
              <div className="frow"><div className="field"><label>Full address *</label><textarea value={form.address} onChange={set('address')} autoComplete="street-address" placeholder="House #, street, landmark…" /></div></div>
              <div className="frow"><div className="field"><label>Delivery notes (optional)</label><input value={form.notes} onChange={set('notes')} placeholder="Best time to deliver, gate code…" /></div></div>
            </div>

            {/* payment */}
            <div className="blk" style={{ marginTop: 18 }}>
              <h2><span className="b">2</span>Payment method</h2>
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
            <div className="line"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="line"><span>Delivery ({BRAND.city})</span><span>{ship === 0 ? <span className="free">FREE</span> : fmt(ship)}</span></div>
            <div className="line tot"><span>Total</span><span>{fmt(total)}</span></div>
            <div className="ship-note">{ship === 0 ? '🎉 You\'ve unlocked free delivery!' : `Add ${fmt(DELIVERY.freeOver - subtotal)} more for free delivery.`}</div>
            {err && <div className="err" role="alert">{err}</div>}
            <button className="place" disabled={!method || busy} onClick={placeOrder}>
              <Raw html={ICONS.check} />{busy ? 'Placing order…' : 'Place order'}
            </button>
            <div className="trust">
              <div><Raw html={ICONS.star} />Rated {BRAND.googleRating}★ on Google</div>
              <div><Raw html={ICONS.truck} />Carefully packed, delivered in {DELIVERY.days}</div>
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
