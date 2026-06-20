'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Raw from '@/components/Raw';
import StoreHeader from '@/components/StoreHeader';
import ProductCard, { MiniFooter } from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { ICONS } from '@/lib/icons';
import { CATALOG, FILTER_CATS, FILTER_LIGHT, FILTER_CARE } from '@/lib/data';

const PER = 8;

export default function Shop() {
  const [cart, setCart] = useState(0);
  const [cat, setCat] = useState(new Set());
  const [light, setLight] = useState(new Set());
  const [care, setCare] = useState(new Set());
  const [pet, setPet] = useState(false);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [sort, setSort] = useState('pop');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);

  const toggle = (set, setter, v) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); setter(n); setPage(1); };

  const filtered = useMemo(() => {
    let r = CATALOG.filter((p) => {
      if (cat.size && !cat.has(p.cat)) return false;
      if (light.size && !light.has(p.light)) return false;
      if (care.size && !care.has(p.care)) return false;
      if (pet && !p.pet) return false;
      if (min !== '' && p.p < +min) return false;
      if (max !== '' && p.p > +max) return false;
      return true;
    });
    r = [...r].sort((a, b) =>
      sort === 'low' ? a.p - b.p : sort === 'high' ? b.p - a.p : sort === 'rate' ? b.r - a.r :
        sort === 'disc' ? (1 - a.p / a.w < 1 - b.p / b.w ? 1 : -1) : b.pop - a.pop);
    return r;
  }, [cat, light, care, pet, min, max, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const curPage = page > pages ? 1 : page;
  const slice = filtered.slice((curPage - 1) * PER, curPage * PER);

  const chips = [];
  cat.forEach((v) => chips.push({ k: 'cat', v }));
  light.forEach((v) => chips.push({ k: 'light', v }));
  care.forEach((v) => chips.push({ k: 'care', v }));
  if (pet) chips.push({ k: 'pet', v: 'Pet safe' });
  if (min !== '' || max !== '') chips.push({ k: 'price', v: `Rs ${min || 0}–${max || '∞'}` });

  const removeChip = (c) => {
    if (c.k === 'cat') toggle(cat, setCat, c.v);
    else if (c.k === 'light') toggle(light, setLight, c.v);
    else if (c.k === 'care') toggle(care, setCare, c.v);
    else if (c.k === 'pet') setPet(false);
    else if (c.k === 'price') { setMin(''); setMax(''); }
  };
  const clearAll = () => { setCat(new Set()); setLight(new Set()); setCare(new Set()); setPet(false); setMin(''); setMax(''); setPage(1); };

  const count = (key, v) => CATALOG.filter((p) => p[key] === v).length;

  const Group = ({ title, arr, set, setter, keyName }) => (
    <div className="fgroup">
      <h4>{title}</h4>
      {arr.map((v) => (
        <label className="opt" key={v}>
          <input type="checkbox" checked={set.has(v)} onChange={() => toggle(set, setter, v)} />
          {v}<span className="ct">{count(keyName, v)}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="pg-shop">
      <StoreHeader active="Shop" cart={cart} />
      <div className="wrap">
        <nav className="crumbs"><Link href="/">Home</Link><span className="s">›</span><span className="cur">Shop</span></nav>
        <h1 className="ptitle q">All Plants &amp; Supplies</h1>
        <div className="psub">Fresh from our Lahore nursery</div>

        <div className="toolbar">
          <button className="filt-toggle" onClick={() => setDrawer(true)}><Raw html={ICONS.filter} />Filters</button>
          <span className="count"><b>{filtered.length}</b> products</span>
          <div className="sort"><span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="pop">Popular</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rate">Top rated</option>
              <option value="disc">Biggest discount</option>
            </select>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="chips">
            {chips.map((c, i) => (
              <span className="chip" key={i} onClick={() => removeChip(c)}>{c.v} <Raw html={ICONS.close} /></span>
            ))}
            <span className="chip clear" onClick={clearAll}>Clear all</span>
          </div>
        )}

        <div className="layout">
          <aside className={`filters${drawer ? ' show' : ''}`}>
            <div className="fclose"><b className="q">Filters</b><button onClick={() => setDrawer(false)}><Raw html={ICONS.close} /></button></div>
            <Group title="Category" arr={FILTER_CATS} set={cat} setter={setCat} keyName="cat" />
            <div className="fgroup"><h4>Price (Rs)</h4>
              <div className="prange">
                <input type="number" placeholder="Min" value={min} onChange={(e) => { setMin(e.target.value); setPage(1); }} />
                <span>–</span>
                <input type="number" placeholder="Max" value={max} onChange={(e) => { setMax(e.target.value); setPage(1); }} />
              </div>
            </div>
            <Group title="Light needs" arr={FILTER_LIGHT} set={light} setter={setLight} keyName="light" />
            <Group title="Care level" arr={FILTER_CARE} set={care} setter={setCare} keyName="care" />
            <div className="fgroup">
              <label className="toggle">Pet safe only<input type="checkbox" checked={pet} onChange={(e) => { setPet(e.target.checked); setPage(1); }} /><span className="sw"></span></label>
            </div>
          </aside>

          <div>
            {slice.length > 0 ? (
              <div className="grid">{slice.map((p, i) => <ProductCard key={i} p={p} onAdd={() => setCart((c) => c + 1)} />)}</div>
            ) : (
              <div className="empty"><Raw html={ICONS.search} />No products match these filters. Try clearing a few.</div>
            )}
            {pages > 1 && (
              <div className="pager">
                {Array.from({ length: pages }, (_, i) => (
                  <button key={i} className={curPage === i + 1 ? 'on' : ''} onClick={() => { setPage(i + 1); window.scrollTo({ top: 200, behavior: 'smooth' }); }}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {drawer && <div className="overlay show" onClick={() => setDrawer(false)}></div>}
      <MiniFooter />
      <WhatsAppButton />
    </div>
  );
}
