'use client';
import { useState } from 'react';
import { addToCart } from '@/lib/cart';
import Link from 'next/link';
import Raw from './Raw';
import PlantArt from './PlantArt';
import { ICONS } from '@/lib/icons';
import Logo from './Logo';
import { BRAND } from '@/lib/brand';

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot">
          <div className="foot-about">
            <Link className="brand q" href="/">
              <Logo light />
            </Link>
            <p>{BRAND.tagline}. A real family nursery in {BRAND.city} — healthy plants delivered across the city, with the care notes to keep them that way.</p>
            <p className="addr">{BRAND.address}<br />{BRAND.phone} · {BRAND.hours}</p>
            <div className="pay">
              {['COD', 'JazzCash', 'Easypaisa', 'Visa', 'Mastercard'].map((p) => <span key={p}>{p}</span>)}
            </div>
          </div>
          <div><h5>Shop</h5><ul><li><Link href="/shop">Indoor plants</Link></li><li><Link href="/shop">Outdoor plants</Link></li><li><Link href="/shop">Pots &amp; planters</Link></li><li><Link href="/shop">Seeds</Link></li></ul></div>
          <div><h5>Help</h5><ul><li><a href="#">Track your order</a></li><li><a href="#">Care guides</a></li><li><a href="#">Delivery &amp; returns</a></li><li><a href="#">Contact us</a></li></ul></div>
          <div><h5>Our nursery</h5><ul><li><a href={BRAND.mapsUrl} target="_blank" rel="noopener">Visit us (Google Maps)</a></li><li><a href={BRAND.mapsUrl} target="_blank" rel="noopener">★ {BRAND.googleRating} on Google</a></li><li><a href="/go/whatsapp?src=footer" rel="nofollow">WhatsApp us</a></li><li><a href="/go/call?src=footer" rel="nofollow">Call {BRAND.phone}</a></li></ul></div>
        </div>
        <div className="foot-bot">
          <span>© {new Date().getFullYear()} {BRAND.name}. Grown in {BRAND.city}.</span>
          <span>Privacy · Terms · Shipping policy</span>
        </div>
      </div>
    </footer>
  );
}

export function MiniFooter() {
  return <footer className="mini-foot">© {new Date().getFullYear()} {BRAND.name}. Grown in {BRAND.city}.</footer>;
}

// Shared product card (homepage carousels, shop grid, related rows)
export default function ProductCard({ p, onAdd }) {
  const [added, setAdded] = useState(false);
  const add = () => { addToCart(p); onAdd?.(); setAdded(true); setTimeout(() => setAdded(false), 1400); };
  // accepts { n, c|cat, p (string|num), w (string|num), d (discount string), r, ct, a }
  const cat = p.c || (p.cat ? `${p.cat} Plants` : '');
  const price = typeof p.p === 'number' ? p.p.toLocaleString() : p.p;
  const was = typeof p.w === 'number' ? p.w.toLocaleString() : p.w;
  const disc = p.d || (p.w ? Math.round((1 - (parseFloat(String(p.p).replace(/,/g, ''))) / (parseFloat(String(p.w).replace(/,/g, '')))) * 100) + '%' : '');
  return (
    <article className="pcard">
      <div className="pimg">
        {disc && <span className="disc">-{disc}</span>}
        <div className="pcic">
          <button aria-label="Save"><Raw html={ICONS.heart} /></button>
          <button aria-label="Quick view"><Raw html={ICONS.eye} /></button>
        </div>
        <button className={`pcart${added ? ' ok' : ''}`} aria-label="Add to cart" title={added ? 'Added to cart' : 'Add to cart'} onClick={add}><Raw html={ICONS[added ? 'check' : 'plus']} /></button>
        <PlantArt name={p.a} />
      </div>
      <div className="pbody">
        <div className="cr">{cat}</div>
        <div className="nm">{p.n}</div>
        {p.r != null && <div className="rt"><span className="st">★</span>{p.r}{p.ct != null ? ` (${p.ct})` : ''}</div>}
        <div className="pr"><span className="now">Rs. {price}</span>{was && <span className="was">Rs. {was}</span>}</div>
      </div>
    </article>
  );
}
