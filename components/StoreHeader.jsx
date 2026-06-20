'use client';
import Link from 'next/link';
import Raw from './Raw';
import { ICONS } from '@/lib/icons';

const NAV = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/shop', label: 'Shop', icon: 'shop' },
  { href: '/shop', label: 'Categories', icon: 'grid' },
  { href: '#', label: 'Care Guides', icon: 'leaf' },
  { href: '#', label: 'Track Order', icon: 'track' },
];

export default function StoreHeader({ active = 'Home', cart = 0, hotline = true }) {
  return (
    <header>
      <div className="promo">
        <div className="wrap">
          <span>🌱 <b>Free plant-care card</b> with every order</span>
          <span className="sep x">•</span>
          <span className="x"><b>Cash on Delivery</b> all over Pakistan</span>
          <span className="sep">•</span>
          <span>Free delivery over <b>Rs 3,000</b></span>
        </div>
      </div>

      <div className="topnav">
        <div className="wrap">
          <div className="row">
            <Link className="brand q" href="/"><Raw className="mark" html={ICONS.brand} /> Sabza</Link>
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
                <Raw html={ICONS.cart} /><span className="cc">{cart}</span>
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
              <a className="hotline" href="tel:+923000000000">
                <span className="ph"><Raw html={ICONS.phone} /></span>
                <span><small>Order on call</small><b>+92 300 0000000</b></span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
