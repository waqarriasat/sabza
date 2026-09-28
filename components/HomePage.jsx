'use client';
import { useState } from 'react';
import Link from 'next/link';
import Raw from '@/components/Raw';
import PlantArt from '@/components/PlantArt';
import StoreHeader from '@/components/StoreHeader';
import { SiteFooter } from '@/components/ProductCard';
import { EMPTY_PAY, faqPayment, pillPayment, citiesNote, codOn } from '@/lib/paytext';
import ProductCard from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { ICONS } from '@/lib/icons';
import { TILE_ICONS, TILE_BG } from '@/lib/plants';
import { TILES, OFFERS, SECTIONS, LAHORE_AREAS } from '@/lib/data';
import { BRAND, DELIVERY } from '@/lib/brand';

const GUIDES = [
  { icon: 'drop', bg: '#DEEAFB', color: '#3E84C4', t: 'Watering basics', p: 'How often to water indoor plants in our climate — without overdoing it.' },
  { icon: 'sun', bg: '#FCF1D6', color: '#E0A21A', t: 'Light & placement', p: 'Find the right spot so your plants actually thrive, not just survive.' },
  { icon: 'leaf', bg: '#E4F1D6', color: '#4A8B2F', t: 'Repotting 101', p: 'When and how to repot, and the soil mix we recommend for each type.' },
];
const STATS = [
  { icon: 'star', num: `${BRAND.googleRating}★`, lbl: 'Rating on Google' },
  { icon: 'leaf', num: 'Own farm', lbl: 'Grown at our nursery' },
  { icon: 'pin', num: 'Lahore', lbl: 'Delivery across the city' },
  { icon: 'truck', num: DELIVERY.days, lbl: 'inDrive delivery in Lahore' },
];
const PILLS = [
  { icon: 'shield', t: '7-day healthy-plant promise' },
  { icon: 'truck', t: 'Carefully packed delivery' },
  { icon: 'card', t: '' }, // payment wording — filled from the admin settings
  { icon: 'check', t: 'Grown at our own nursery' },
];
const FAQS = [
  ['Do you deliver live plants safely?', `Yes — every plant is packed in a secure box with the soil wrapped so it stays in place. In Lahore we deliver ${DELIVERY.fast}, or ${DELIVERY.courier}. We include a care card so your plant settles in happily.`],
  ['What if my plant arrives damaged?', "Our 7-day healthy-plant promise has you covered. Just send a photo on WhatsApp within 7 days and we'll arrange a replacement or refund."],
  ['Can I pay cash on delivery?', 'Yes — Cash on Delivery is available on courier orders (2–3 days). Same-day inDrive orders are paid in advance by JazzCash, Easypaisa or bank transfer.'],
  ['Do you deliver outside Lahore?', `Not yet — ${DELIVERY.areaNote} You're also welcome to visit the nursery at ${BRAND.address}.`],
  ['Can I visit the nursery?', `Yes! We're at ${BRAND.address} (${BRAND.hours.toLowerCase()}). Call or WhatsApp ${BRAND.phone} before you come.`],
  ['How do I care for my new plant?', 'Each plant ships with a care card covering light, water and feeding. You can also browse our care guides any time for season-specific tips.'],
];

export default function Home({ pay = EMPTY_PAY }) {

  return (
    <div className="pg-home">
      <StoreHeader active="Home" />

      {/* hero */}
      <section className="hero"><div className="wrap"><div className="hero-grid">
        <div className="banner main">
          <span className="eb">Fresh from our nursery</span>
          <h1>Bring your home to life with healthy plants</h1>
          <p>Hand-grown at {BRAND.name}, carefully packed, and delivered across {BRAND.city} the same day.</p>
          <Link className="b" href="/shop">Shop plants <Raw html={ICONS.arrowR} /></Link>
          <div className="art"><PlantArt name="foliage" /></div>
        </div>
        <div className="side-stack">
          <div className="banner side"><h3>Winter Sale</h3><span>Up to 40% off indoor plants</span><Link className="b" href="/shop">Grab the deal</Link></div>
          <div className="banner side" style={{ background: 'linear-gradient(120deg,#E0A21A,#C9871A)' }}><h3>New Arrivals</h3><span>Fresh stock, just added</span><Link className="b" href="/shop">See what's new</Link></div>
        </div>
      </div></div></section>

      {/* category tiles */}
      <section className="sec"><div className="wrap">
        <div className="sec-h"><div><h2>Shop by category</h2><p>Find exactly what your space needs</p></div><Link className="all" href="/shop">View all <Raw html={ICONS.arrowR} /></Link></div>
        <div className="tiles">
          {TILES.map((t) => (
            <Link className="tile" href="/shop" key={t}>
              <div className="ti" style={{ background: TILE_BG[t] }}><Raw html={TILE_ICONS[t]} /></div>
              <span>{t}</span>
            </Link>
          ))}
        </div>
      </div></section>

      {/* offers */}
      <section className="sec" style={{ paddingTop: 4 }}><div className="wrap">
        <div className="offers">
          {OFFERS.map((o, i) => (
            <div className={`offer ${o.cls}`} key={i}>
              <div className="oi"><Raw html={ICONS[o.icon]} /></div>
              <h3>{o.title}</h3><div className="sub">{o.sub}</div><small>{o.small}</small>
              <Link className="all" href="/shop" style={{ marginTop: 13 }}>Shop now <Raw html={ICONS.arrowR} /></Link>
            </div>
          ))}
        </div>
      </div></section>

      {/* product carousels */}
      {SECTIONS.map((s, i) => (
        <section className="sec" key={i}><div className="wrap">
          <div className="cat-banner" style={{ background: s.bg }}>
            <div className="cb-ic">{s.emoji}</div>
            <div><h2>{s.t}</h2><p>Handpicked from our latest stock</p></div>
            <Link href="/shop">{s.link} <Raw html={ICONS.arrowR} /></Link>
          </div>
          <div className="prow">
            {s.items.map((p, j) => <ProductCard key={j} p={p} />)}
          </div>
        </div></section>
      ))}

      {/* cities */}
      <section className="sec"><div className="wrap">
        <div className="sec-h"><div><h2>Delivering across Lahore</h2><p>Fresh from our farm in Shadab Colony to your door</p></div><a className="all" href={BRAND.mapsUrl} target="_blank" rel="noopener">Visit the nursery <Raw html={ICONS.arrowR} /></a></div>
        <div className="cities">
          {LAHORE_AREAS.map((c) => (
            <Link className="city" href="/shop" key={c}>
              <div className="cp"><Raw html={ICONS.pin} /></div>
              <div><b>{c}</b><small>Same-day delivery</small></div>
              <div className="chev"><Raw html={ICONS.chevR} /></div>
            </Link>
          ))}
        </div>
        <p className="cities-note">{citiesNote(pay)}</p>
      </div></section>

      {/* care guides */}
      <section className="sec"><div className="wrap">
        <div className="sec-h"><div><h2>Plant care made simple</h2><p>Free guides to keep your plants thriving</p></div><Link className="all" href="#">All guides <Raw html={ICONS.arrowR} /></Link></div>
        <div className="guides">
          {GUIDES.map((g, i) => (
            <Link className="guide" href="#" key={i}>
              <div className="gi" style={{ background: g.bg, color: g.color }}><Raw html={ICONS[g.icon]} /></div>
              <div><h4>{g.t}</h4><p>{g.p}</p></div>
            </Link>
          ))}
        </div>
      </div></section>

      {/* why */}
      <section className="sec"><div className="wrap"><div className="why">
        <h2>Why Lahore chooses {BRAND.short}</h2>
        <div className="stats">
          {STATS.map((s, i) => (
            <div className="stat" key={i}><div className="si"><Raw html={ICONS[s.icon]} /></div><div className="num">{s.num}</div><div className="lbl">{s.lbl}</div></div>
          ))}
        </div>
        <div className="pills">
          {PILLS.map((p, i) => <span className="pill" key={i}><Raw html={ICONS[p.icon]} />{p.t || pillPayment(pay)}</span>)}
        </div>
        <p className="fast">Grown with care at <b>{BRAND.name}</b>, {BRAND.city} · <a href={BRAND.mapsUrl} target="_blank" rel="noopener">See our Google reviews</a></p>
      </div></div></section>

      {/* faq */}
      <section className="sec"><div className="wrap">
        <div className="faq-head">
          <span className="tag"><Raw html={ICONS.leaf} /> FAQ</span>
          <h2>Questions, answered</h2>
          <p>Everything you need to know before you order</p>
        </div>
        <div className="faq">
          {FAQS.map((f) => (f[0] === 'Can I pay cash on delivery?' ? [codOn(pay) ? f[0] : 'How can I pay?', faqPayment(pay)] : f)).map((f, i) => (
            <details className="qa" key={i}>
              <summary>{f[0]}<span className="chev"><Raw html={ICONS.chevD} /></span></summary>
              <div className="ans">{f[1]}</div>
            </details>
          ))}
        </div>
      </div></section>

      <SiteFooter pay={pay} />
      <WhatsAppButton />
    </div>
  );
}
