'use client';
import { useState } from 'react';
import Link from 'next/link';
import Raw from '@/components/Raw';
import PlantArt from '@/components/PlantArt';
import { ICONS } from '@/lib/icons';
import { START_CART, fmt } from '@/lib/data';

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Other city'];

export default function Checkout({ payments }) {
  const [cart, setCart] = useState(START_CART);
  const [pay, setPay] = useState(payments[0]?.id || '');
  const [txn, setTxn] = useState('');
  const [copied, setCopied] = useState('');
  const [done, setDone] = useState(false);

  const setQty = (i, d) => setCart((c) => c.map((it, j) => j === i ? { ...it, q: Math.max(1, it.q + d) } : it));
  const remove = (i) => setCart((c) => c.filter((_, j) => j !== i));

  const sub = cart.reduce((s, c) => s + c.p * c.q, 0);
  const ship = sub >= 3000 ? 0 : 200;
  const total = sub + ship;
  const count = cart.reduce((s, c) => s + c.q, 0);
  const method = payments.find((p) => p.id === pay);
  const payLabel = method ? method.name : '—';
  const needsTxn = method && method.accounts.length > 0 && method.kind !== 'cod' && method.kind !== 'card';
  const copy = (text) => {
    navigator.clipboard?.writeText(text.replace(/\s+/g, '')).then(() => { setCopied(text); setTimeout(() => setCopied(''), 1500); });
  };

  if (done) {
    return (
      <div className="pg-checkout">
        <div className="cpromo"><b>Cash on Delivery</b> available all over Pakistan · Free delivery over Rs 3,000</div>
        <SlimHeader />
        <div className="wrap"><div className="done">
          <div className="ck"><Raw html={ICONS.check} /></div>
          <h2 className="q">Order placed! 🌱</h2>
          <p>Thank you. Your order <span className="oid">#SBZ-48213</span> is confirmed.<br />We'll WhatsApp you the tracking details shortly.</p>
          <p style={{ marginTop: 6 }}>Paid by: <b style={{ color: 'var(--ink)' }}>{payLabel}</b></p>
          <Link href="/">Back to shop</Link>
        </div></div>
      </div>
    );
  }

  return (
    <div className="pg-checkout">
      <div className="cpromo"><b>Cash on Delivery</b> available all over Pakistan · Free delivery over Rs 3,000</div>
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
              {cart.map((c, i) => (
                <div className="citem" key={i}>
                  <div className="im"><PlantArt name={c.a} /></div>
                  <div style={{ flex: 1 }}>
                    <div className="nm">{c.n}</div>
                    <div className="va">{c.v}</div>
                    <div className="bot">
                      <div className="qty">
                        <button onClick={() => setQty(i, -1)}>−</button><span>{c.q}</span><button onClick={() => setQty(i, 1)}>+</button>
                      </div>
                      <button className="rm" onClick={() => remove(i)}><Raw html={ICONS.trash} />Remove</button>
                    </div>
                  </div>
                  <div className="pr"><div className="now">{fmt(c.p * c.q)}</div><div className="ea">{fmt(c.p)} each</div></div>
                </div>
              ))}
            </div>

            {/* contact */}
            <div className="blk" style={{ marginTop: 18 }}>
              <h2><span className="b">1</span>Contact &amp; delivery</h2>
              <div className="frow two">
                <div className="field"><label>Full name</label><input placeholder="e.g. Ahmed Khan" /></div>
                <div className="field"><label>Phone number</label><input placeholder="03xx xxxxxxx" /></div>
              </div>
              <div className="frow"><div className="field"><label>Email (optional — for order updates)</label><input placeholder="you@email.com" /></div></div>
              <div className="frow two">
                <div className="field"><label>City</label><select>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
                <div className="field"><label>Area / Town</label><input placeholder="e.g. DHA Phase 5" /></div>
              </div>
              <div className="frow"><div className="field"><label>Full address</label><textarea placeholder="House #, street, landmark…" /></div></div>
              <div className="frow"><div className="field"><label>Delivery notes (optional)</label><input placeholder="Gate code, best time to deliver…" /></div></div>
            </div>

            {/* payment */}
            <div className="blk" style={{ marginTop: 18 }}>
              <h2><span className="b">2</span>Payment method</h2>
              {payments.length === 0 && <p className="pay-none">Online payment is not available right now. Please contact us on WhatsApp to place your order.</p>}
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
                          <div className="field"><label>Transaction ID / reference</label>
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
            <div className="line"><span>Subtotal</span><span>{fmt(sub)}</span></div>
            <div className="line"><span>Delivery</span><span>{ship === 0 ? <span className="free">FREE</span> : fmt(ship)}</span></div>
            {method?.kind === 'cod' && <div className="line"><span>COD handling</span><span>Rs. 0</span></div>}
            <div className="promo-in"><input placeholder="Promo code" /><button>Apply</button></div>
            <div className="line tot"><span>Total</span><span>{fmt(total)}</span></div>
            <div className="ship-note">{ship === 0 ? '🎉 You\'ve unlocked free delivery!' : `Add ${fmt(3000 - sub)} more for free delivery.`}</div>
            <button className="place" disabled={!method} onClick={() => { setDone(true); window.scrollTo({ top: 0 }); }}>
              <Raw html={ICONS.check} />Place order
            </button>
            <div className="trust">
              <div><Raw html={ICONS.shield} />7-day healthy-plant promise</div>
              <div><Raw html={ICONS.truck} />Carefully packed, delivered in 2–4 days</div>
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
      <Link className="brand q" href="/"><Raw className="mark" html={ICONS.brand} /> Sabza</Link>
      <span className="secure"><Raw html={ICONS.shieldCheck} />Secure checkout</span>
    </div></div></div>
  );
}
