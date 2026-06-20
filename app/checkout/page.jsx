'use client';
import { useState } from 'react';
import Link from 'next/link';
import Raw from '@/components/Raw';
import PlantArt from '@/components/PlantArt';
import { ICONS } from '@/lib/icons';
import { START_CART, fmt } from '@/lib/data';

const PAYMENTS = [
  { id: 'cod', b: 'Cash on Delivery', s: 'Pay in cash when your plants arrive', bg: 'var(--green)', icon: 'truck', rec: 'Most popular' },
  { id: 'jc', b: 'JazzCash', s: 'Pay from your JazzCash wallet', bg: '#C8102E', text: 'JC' },
  { id: 'ep', b: 'Easypaisa', s: 'Pay from your Easypaisa wallet', bg: '#00A651', text: 'EP' },
  { id: 'card', b: 'Debit / Credit Card', s: 'Visa, Mastercard — secure', bg: '#1A56DB', icon: 'card' },
  { id: 'bank', b: 'Bank transfer', s: 'Transfer to our account, share receipt', bg: '#6B7280', icon: 'bank' },
];
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Other city'];

export default function Checkout() {
  const [cart, setCart] = useState(START_CART);
  const [pay, setPay] = useState('cod');
  const [done, setDone] = useState(false);

  const setQty = (i, d) => setCart((c) => c.map((it, j) => j === i ? { ...it, q: Math.max(1, it.q + d) } : it));
  const remove = (i) => setCart((c) => c.filter((_, j) => j !== i));

  const sub = cart.reduce((s, c) => s + c.p * c.q, 0);
  const ship = sub >= 3000 ? 0 : 200;
  const total = sub + ship;
  const count = cart.reduce((s, c) => s + c.q, 0);
  const payLabel = PAYMENTS.find((p) => p.id === pay).b;

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
              <div className="pay">
                {PAYMENTS.map((p) => (
                  <label className={`pm${pay === p.id ? ' on' : ''}`} key={p.id} onClick={() => setPay(p.id)}>
                    <span className="radio"></span>
                    <span className="ic" style={{ background: p.bg }}>{p.icon ? <Raw html={ICONS[p.icon]} /> : p.text}</span>
                    <span><b>{p.b}</b><small>{p.s}</small></span>
                    {p.rec && <span className="rec">{p.rec}</span>}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* summary */}
          <div className="blk sum">
            <h2><span className="b">📋</span>Order summary</h2>
            <div className="line"><span>Subtotal</span><span>{fmt(sub)}</span></div>
            <div className="line"><span>Delivery</span><span>{ship === 0 ? <span className="free">FREE</span> : fmt(ship)}</span></div>
            <div className="line"><span>COD handling</span><span>Rs. 0</span></div>
            <div className="promo-in"><input placeholder="Promo code" /><button>Apply</button></div>
            <div className="line tot"><span>Total</span><span>{fmt(total)}</span></div>
            <div className="ship-note">{ship === 0 ? '🎉 You\'ve unlocked free delivery!' : `Add ${fmt(3000 - sub)} more for free delivery.`}</div>
            <button className="place" onClick={() => { setDone(true); window.scrollTo({ top: 0 }); }}>
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
