'use client';
import { useState } from 'react';
import Link from 'next/link';
import Raw from '@/components/Raw';
import PlantArt from '@/components/PlantArt';
import StoreHeader from '@/components/StoreHeader';
import ProductCard, { SiteFooter } from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { ICONS } from '@/lib/icons';
import { PRODUCT, fmt } from '@/lib/data';

const TABS = ['Description', 'Care guide', 'Specifications', 'Reviews'];

export default function ProductPage() {
  const P = PRODUCT;
  const [cart, setCart] = useState(0);
  const [size, setSize] = useState(P.sizes[0].id);
  const [pot, setPot] = useState(P.pots[0].id);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('Description');

  const sizeObj = P.sizes.find((s) => s.id === size);
  const potObj = P.pots.find((p) => p.id === pot);
  const price = sizeObj.price + potObj.add;
  const was = sizeObj.was + potObj.add;
  const save = Math.round((1 - price / was) * 100);

  const add = () => setCart((c) => c + qty);

  return (
    <div className="pg-product">
      <StoreHeader active="Shop" cart={cart} />
      <div className="wrap">
        <nav className="crumbs">
          <Link href="/">Home</Link><span className="s">›</span>
          <Link href="/shop">Shop</Link><span className="s">›</span>
          <Link href="/shop">Indoor Plants</Link><span className="s">›</span>
          <span className="cur">{P.name}</span>
        </nav>

        <div className="pd">
          {/* gallery */}
          <div className="gal">
            <div className="main">
              <span className="disc">-{save}%</span>
              <button className="wish"><Raw html={ICONS.heart} /></button>
              <PlantArt name={P.art} />
            </div>
            <div className="thumbs">
              {[0, 1, 2, 3].map((i) => (
                <div className={`thumb${i === 0 ? ' on' : ''}`} key={i}><PlantArt name={P.art} /></div>
              ))}
            </div>
          </div>

          {/* info */}
          <div className="info">
            <span className="crumb-tag">{P.cat}</span>
            <h1>{P.name}</h1>
            <div className="sci">{P.sci}</div>
            <div className="rrow">
              <span className="stars">★★★★★</span>
              <span className="rt">{P.rating} · {P.reviews} reviews</span>
              <span className="stock"><i></i> In stock</span>
            </div>
            <div className="priceblk">
              <span className="now">{fmt(price)}</span>
              <span className="was">{fmt(was)}</span>
              <span className="save">Save {save}%</span>
            </div>
            <div className="tax">Inclusive of all taxes · Free delivery over Rs 3,000</div>
            <p className="desc">{P.desc}</p>

            {/* size */}
            <div className="opt">
              <div className="lab">Size <span>· {sizeObj.label}</span></div>
              <div className="choices">
                {P.sizes.map((s) => (
                  <button className={`choice${size === s.id ? ' on' : ''}`} key={s.id} onClick={() => setSize(s.id)}>
                    {s.label}<small>{s.sub}</small>
                  </button>
                ))}
              </div>
            </div>
            {/* pot */}
            <div className="opt">
              <div className="lab">Pot <span>· {potObj.label}</span></div>
              <div className="choices">
                {P.pots.map((p) => (
                  <button className={`choice${pot === p.id ? ' on' : ''}`} key={p.id} onClick={() => setPot(p.id)}>
                    {p.label}<small>{p.sub}</small>
                  </button>
                ))}
              </div>
            </div>

            {/* buy */}
            <div className="buyrow">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              <button className="btn btn-add" onClick={add}><Raw html={ICONS.cart} />Add to cart</button>
              <Link className="btn btn-buy" href="/checkout"><Raw html={ICONS.bag} />Buy now</Link>
            </div>

            {/* care facts */}
            <div className="care">
              {P.facts.map((f, i) => (
                <div className="cf" key={i}>
                  <div className="ci"><Raw html={ICONS[f.icon]} /></div>
                  <div><small>{f.label}</small><b>{f.val}</b></div>
                </div>
              ))}
            </div>

            {/* delivery */}
            <div className="delv">
              <div className="dl"><Raw html={ICONS.truck} /><div><b>Free delivery over Rs 3,000.</b> <span>Delivered in 2–4 working days, carefully packed.</span></div></div>
              <div className="dl"><Raw html={ICONS.card} /><div><b>Cash on Delivery available.</b> <span>Plus JazzCash, Easypaisa, card &amp; bank transfer.</span></div></div>
              <div className="dl"><Raw html={ICONS.shield} /><div><b>7-day healthy-plant promise.</b> <span>Arrives unhappy? We'll replace or refund.</span></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="wrap"><div className="tabs-wrap">
        <div className="tabs">
          {TABS.map((t) => <button className={`tab${tab === t ? ' on' : ''}`} key={t} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === 'Description' && (
          <div className="panel">
            <h3>About this plant</h3>
            <p>{P.desc}</p>
            <p>Each plant is grown and acclimatised at our Lahore nursery, so it's already used to local conditions before it reaches your home — meaning less transplant shock and a happier plant.</p>
            <h3>What's in the box</h3>
            <p>Your Monstera in its grow-pot (or chosen ceramic pot), packed securely with soil wrapped to stay in place, plus a printed care card with watering and light tips.</p>
          </div>
        )}
        {tab === 'Care guide' && (
          <div className="panel">
            <h3>Light</h3><p>Bright, indirect light is ideal. Avoid harsh direct sun, which can scorch the leaves. A few feet from an east or north-facing window works beautifully.</p>
            <h3>Water</h3><p>Water roughly once a week — let the top inch of soil dry out between waterings. Reduce in winter. Yellow leaves usually mean overwatering.</p>
            <h3>Feeding</h3><p>Feed with a balanced liquid fertiliser once a month through spring and summer for lush, fast growth.</p>
          </div>
        )}
        {tab === 'Specifications' && (
          <div className="panel">
            <div className="spec">{P.specs.map((s, i) => <div key={i}><b>{s[0]}</b><span>{s[1]}</span></div>)}</div>
          </div>
        )}
        {tab === 'Reviews' && (
          <div className="panel"><div className="rev">
            <div className="rsum">
              <div className="big">{P.rating}</div>
              <div className="stx">★★★★★</div>
              <div className="cnt">Based on {P.reviews} reviews</div>
              <div className="bars">
                {[[5, 80], [4, 15], [3, 5], [2, 0], [1, 0]].map(([n, w]) => (
                  <div className="bar" key={n}>{n}★<div className="track"><div className="fill" style={{ width: `${w}%` }}></div></div>{w}%</div>
                ))}
              </div>
            </div>
            <div className="rlist">
              {P.reviewsList.map((r, i) => (
                <div className="rcard" key={i}>
                  <div className="top">
                    <div className="av">{r.av}</div>
                    <div><div className="nm">{r.nm}</div><div className="dt">{r.meta}</div></div>
                    <div className="stx">{'★'.repeat(r.st)}{'☆'.repeat(5 - r.st)}</div>
                  </div>
                  <p>{r.body}</p>
                </div>
              ))}
              <button className="writebtn">Write a review</button>
            </div>
          </div></div>
        )}
      </div></div>

      {/* related */}
      <section className="wrap" style={{ paddingBottom: 30 }}>
        <h2 className="sec-h2">You might also like</h2>
        <div className="prow">
          {P.related.map((p, i) => <ProductCard key={i} p={p} onAdd={() => setCart((c) => c + 1)} />)}
        </div>
      </section>

      {/* mobile sticky buy bar */}
      <div className="sticky">
        <div className="sp">{fmt(price)}<small>{sizeObj.label} · {potObj.label}</small></div>
        <button className="btn-add" onClick={add}><Raw html={ICONS.cart} />Add to cart</button>
      </div>

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
