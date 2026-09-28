'use client';
import Link from 'next/link';
import Raw from './Raw';
import { ICONS } from '@/lib/icons';
import Logo from './Logo';
import { BRAND } from '@/lib/brand';
import { useCart } from '@/lib/cart';

const NAV = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/shop', label: 'Shop', icon: 'shop' },
  { href: '/shop', label: 'Categories', icon: 'grid' },
  { href: '#', label: 'Care Guides', icon: 'leaf' },
  { href: '#', label: 'Track Order', icon: 'track' },
];

export default function StoreHeader({ active = 'Home', hotline = true }) {
  const { count } = useCart();
  return (
    <header>
      <div className="promo">
        <div className="wrap">
          <span>🌱 <b>Free plant-care card</b> with every order</span>
          <span className="sep x">•</span>
          <span className="x"><b>Same-day delivery</b> in Lahore</span>
          <span className="sep">•</span>
          <span><b>Courier</b> to all Pakistan for seeds &amp; pots</span>
        </div>
      </div>

      <div className="topnav">
        <div className="wrap">
          <div className="row">
            <Link className="brand" href="/"><Logo light /></Link>
            <nav className="links">
              {NAV.map((n, i) => (
                <Link key={i} className={n.label === active ? 'on' : ''} href={n.href}>
                  <Raw html={ICONS[n.icon]} />{n.label}
                </Link>
              ))}
            </nav>
            <div className="head-ic">
              <Link className="ib" href="#" aria-label="Wishlist"><Raw html={ICONS.heart} /></Link>
              <Link className="ib" href="/checkout" aria-label="Cart">
                <Raw html={ICONS.cart} />{count > 0 && <span className="cc">{count}</span>}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="searchbar">
        <div className="wrap">
          <div className="row">
            <button className="burger" aria-label="Menu"><Raw html={ICONS.menu} /></button>
            <div className="sfield">
              <Raw html={ICONS.search} />
              <input placeholder="Search plants, pots, seeds, soil…" />
            </div>
            <button className="sfilt" aria-label="Filters"><Raw html={ICONS.filter} /></button>
            {hotline && (
              <a className="hotline" href="/go/call?src=header" rel="nofollow">
                <span className="ph"><Raw html={ICONS.phone} /></span>
                <span><small>Order on call</small><b>{BRAND.phone}</b></span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
