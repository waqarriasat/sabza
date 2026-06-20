'use client';
import Link from 'next/link';
import Raw from './Raw';
import PlantArt from './PlantArt';
import { ICONS } from '@/lib/icons';

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot">
          <div className="foot-about">
            <Link className="brand q" href="/">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Raw className="mark" html={ICONS.brandSoft} /> Sabza
              </span>
            </Link>
            <p>A working nursery, online. Healthy plants delivered across Pakistan — with the care notes to keep them that way.</p>
            <div className="pay">
              {['COD', 'JazzCash', 'Easypaisa', 'Visa', 'Mastercard'].map((p) => <span key={p}>{p}</span>)}
            </div>
          </div>
          <div><h5>Shop</h5><ul><li><Link href="/shop">Indoor plants</Link></li><li><Link href="/shop">Outdoor plants</Link></li><li><Link href="/shop">Pots &amp; planters</Link></li><li><Link href="/shop">Seeds</Link></li></ul></div>
          <div><h5>Help</h5><ul><li><a href="#">Track your order</a></li><li><a href="#">Care guides</a></li><li><a href="#">Delivery &amp; returns</a></li><li><a href="#">Contact us</a></li></ul></div>
          <div><h5>Sabza</h5><ul><li><a href="#">Our nursery</a></li><li><a href="#">Bulk orders</a></li><li><a href="#">WhatsApp us</a></li></ul></div>
        </div>
        <div className="foot-bot">
          <span>© 2026 Sabza. Grown in Lahore.</span>
          <span>Privacy · Terms · Shipping policy</span>
        </div>
      </div>
    </footer>
  );
}

export function MiniFooter() {
  return <footer className="mini-foot">© 2026 Sabza. Grown in Lahore.</footer>;
}

// Shared product card (homepage carousels, shop grid, related rows)
export default function ProductCard({ p, onAdd }) {
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
        <button className="pcart" aria-label="Add to cart" onClick={onAdd}><Raw html={ICONS.plus} /></button>
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
