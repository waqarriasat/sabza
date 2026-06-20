'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Raw from '@/components/Raw';
import { ICONS } from '@/lib/icons';
import { PLANTS } from '@/lib/plants';
import { ADMIN_STATS, CHART, LOW_STOCK, ADMIN_ORDERS, ADMIN_PRODUCTS } from '@/lib/data';

// Sidebar menu, grouped. `dash` is always shown; the rest can be toggled off.
const GROUPS = [
  {
    grp: 'Overview',
    items: [
      { v: 'dash', label: 'Dashboard', icon: 'dash', fixed: true },
      { v: 'orders', label: 'Orders', icon: 'orders', bd: 5 },
      { v: 'products', label: 'Products', icon: 'leaf' },
      { v: 'cats', label: 'Categories', icon: 'grid' },
    ],
  },
  {
    grp: 'Manage',
    items: [
      { v: 'customers', label: 'Customers', icon: 'customers' },
      { v: 'discounts', label: 'Discounts', icon: 'discount' },
      { v: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
];
const TITLES = { dash: 'Dashboard', orders: 'Orders', products: 'Products', cats: 'Categories', customers: 'Customers', discounts: 'Discounts', settings: 'Settings' };
const ORD_ST = { Pending: 'b-orange', Confirmed: 'b-blue', Packed: 'b-purple', Delivered: 'b-green', Cancelled: 'b-red' };
const PR_ST = { Active: 'b-green', 'Out of stock': 'b-red', Draft: 'b-grey' };
const mx = Math.max(...CHART.map((c) => c.v));

// Everything that can be shown/hidden, plus its default state.
const DEFAULT_VIS = {
  // dashboard widgets
  stats: true, chart: true, low: true, recent: true,
  // sidebar menu items
  orders: true, products: true, cats: true, customers: true, discounts: true, settings: true,
};
const STORE_KEY = 'sabza-admin-vis';
const SLIDERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h11M19 6h1M4 12h1M9 12h11M4 18h7M15 18h5" stroke-linecap="round"/><circle cx="17" cy="6" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></svg>';

const Art = ({ a }) => <Raw html={PLANTS[a] || PLANTS.foliage} />;

function Toggle({ on, onChange, label, sub }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}>
      <span style={{ flex: 1 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, display: 'block' }}>{label}</span>
        {sub && <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{sub}</span>}
      </span>
      <input type="checkbox" checked={on} onChange={onChange} style={{ display: 'none' }} />
      <span style={{ width: 42, height: 24, borderRadius: 12, background: on ? 'var(--green)' : '#D8DECF', position: 'relative', transition: '.2s', flex: '0 0 auto' }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: '.2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
      </span>
    </label>
  );
}

function OrdersTable({ list }) {
  return (
    <table>
      <thead><tr><th>Order</th><th>Customer</th><th>City</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        {list.map((o, i) => (
          <tr key={i}>
            <td><b>{o.id}</b></td><td>{o.c}</td><td>{o.city}</td><td>{o.items}</td>
            <td><b>Rs {o.total.toLocaleString()}</b></td><td>{o.pay}</td>
            <td><span className={`badge ${ORD_ST[o.st]}`}>{o.st}</span></td>
            <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{o.d}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Admin() {
  const [view, setView] = useState('dash');
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [vis, setVis] = useState(DEFAULT_VIS);

  // load saved visibility once mounted (avoids hydration mismatch)
  useEffect(() => {
    try {
      const s = localStorage.getItem(STORE_KEY);
      if (s) setVis({ ...DEFAULT_VIS, ...JSON.parse(s) });
    } catch (e) {}
  }, []);
  // persist on change
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(vis)); } catch (e) {}
  }, [vis]);
  // if the open view gets hidden, fall back to the dashboard
  useEffect(() => {
    if (view !== 'dash' && vis[view] === false) setView('dash');
  }, [vis, view]);

  const setVisKey = (k) => setVis((v) => ({ ...v, [k]: !v[k] }));
  const go = (v) => { setView(v); setDrawer(false); window.scrollTo({ top: 0 }); };

  const DASH_WIDGETS = [
    { k: 'stats', label: 'Stat cards', sub: 'Revenue, orders, products, low stock' },
    { k: 'chart', label: 'Sales chart', sub: 'Last 7 days' },
    { k: 'low', label: 'Low stock alerts', sub: 'Items that need restocking' },
    { k: 'recent', label: 'Recent orders', sub: 'Latest 5 orders' },
  ];
  const MENU_ITEMS = [
    { k: 'orders', label: 'Orders' }, { k: 'products', label: 'Products' }, { k: 'cats', label: 'Categories' },
    { k: 'customers', label: 'Customers' }, { k: 'discounts', label: 'Discounts' }, { k: 'settings', label: 'Settings' },
  ];

  return (
    <div className="admin">
      <aside className={`side${drawer ? ' show' : ''}`}>
        <div className="logo q"><Raw className="m" html={ICONS.brandSoft} /> Sabza</div>
        <nav>
          {GROUPS.map((g) => {
            const items = g.items.filter((n) => n.fixed || vis[n.v]);
            if (items.length === 0) return null;
            return (
              <span key={g.grp} style={{ display: 'contents' }}>
                <div className="grp">{g.grp}</div>
                {items.map((n) => (
                  <a key={n.v} className={view === n.v ? 'on' : ''} onClick={() => go(n.v)}>
                    <Raw html={ICONS[n.icon]} />{n.label}{n.bd ? <span className="bd">{n.bd}</span> : null}
                  </a>
                ))}
              </span>
            );
          })}
        </nav>
        <div className="bottom"><Link className="store" href="/"><Raw html={ICONS.storefront} />View store ↗</Link></div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="menu" onClick={() => setDrawer(true)}><Raw html={ICONS.menu} /></button>
          <h1 className="q">{TITLES[view]}</h1>
          <div className="tsearch"><Raw html={ICONS.search} /><input placeholder="Search orders, products…" /></div>
          <button className="tic" title="Customize panel" onClick={() => setCustomize(true)}><Raw html={SLIDERS} /></button>
          <button className="tic"><Raw html={ICONS.bell} /><span className="dot"></span></button>
          <div className="avatar">W</div>
        </div>

        <div className="content">
          {/* DASHBOARD */}
          {view === 'dash' && (
            <>
              {vis.stats && (
                <div className="stats">
                  {ADMIN_STATS.map((s, i) => (
                    <div className="scard" key={i}>
                      <div className="ico" style={{ background: s.bg }}><Raw html={ICONS[s.icon]} style={{ color: s.color }} /></div>
                      <div className="lbl">{s.label}</div>
                      <div className="val">{s.val}</div>
                      <div className={`tr ${s.tr}`}><Raw html={ICONS[s.tr === 'up' ? 'trendUp' : 'trendDown']} />{s.note}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="panels">
                {vis.chart && (
                  <div className="pnl">
                    <div className="ph"><h3>Sales — last 7 days</h3><a>View report</a></div>
                    <div className="chart">
                      {CHART.map((c, i) => (
                        <div className="col" key={i}><div className="bar" style={{ height: `${c.v / mx * 100}%` }} title={`Rs ${(c.v * 1000).toLocaleString()}`}></div><div className="dy">{c.d}</div></div>
                      ))}
                    </div>
                  </div>
                )}
                {vis.low && (
                  <div className="pnl">
                    <div className="ph"><h3>Low stock alerts</h3>{vis.products && <a onClick={() => go('products')}>Manage</a>}</div>
                    <div className="lowlist">
                      {LOW_STOCK.map((l, i) => (
                        <div className="lowrow" key={i}><div className="th"><Art a={l.a} /></div><div><b>{l.n}</b></div><div className="st stock-low">{l.s} left</div></div>
                      ))}
                    </div>
                  </div>
                )}
                {vis.recent && (
                  <div className="pnl full">
                    <div className="ph"><h3>Recent orders</h3>{vis.orders && <a onClick={() => go('orders')}>All orders</a>}</div>
                    <div className="tbl-wrap"><OrdersTable list={ADMIN_ORDERS.slice(0, 5)} /></div>
                  </div>
                )}
                {!vis.stats && !vis.chart && !vis.low && !vis.recent && (
                  <div className="pnl full"><div className="ph-soon"><Raw html={SLIDERS} />Every dashboard section is hidden. Tap the customize button (top-right) to switch sections back on.</div></div>
                )}
              </div>
            </>
          )}

          {/* ORDERS */}
          {view === 'orders' && (
            <>
              <div className="ptools">
                <div className="tsearch"><Raw html={ICONS.search} /><input placeholder="Search by order # or customer…" /></div>
                <button className="btn btn-out"><Raw html={ICONS.filter} />Filter</button>
                <button className="btn btn-out"><Raw html={ICONS.exportData} />Export</button>
              </div>
              <div className="pnl"><div className="tbl-wrap"><OrdersTable list={ADMIN_ORDERS} /></div></div>
            </>
          )}

          {/* PRODUCTS */}
          {view === 'products' && (
            <>
              <div className="ptools">
                <div className="tsearch"><Raw html={ICONS.search} /><input placeholder="Search products…" /></div>
                <button className="btn btn-out"><Raw html={ICONS.importCsv} />Import CSV</button>
                <button className="btn btn-pri" onClick={() => setModal(true)}><Raw html={ICONS.plus} />Add product</button>
              </div>
              <div className="pnl"><div className="tbl-wrap">
                <table>
                  <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {ADMIN_PRODUCTS.map((p, i) => (
                      <tr key={i}>
                        <td><div className="prod"><div className="th"><Art a={p.a} /></div><div><b>{p.n}</b><small>{p.sci}</small></div></div></td>
                        <td>{p.cat}</td><td><b>Rs {p.p.toLocaleString()}</b></td>
                        <td><span className={p.stock <= 5 ? 'stock-low' : ''}>{p.stock}</span></td>
                        <td><span className={`badge ${PR_ST[p.st]}`}>{p.st}</span></td>
                        <td><div className="act">
                          <button title="Edit"><Raw html={ICONS.edit} /></button>
                          <button className="del" title="Delete"><Raw html={ICONS.trash} /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div></div>
            </>
          )}

          {/* placeholders */}
          {view === 'cats' && <Soon icon="grid">Category management — Indoor, Outdoor, Trees, Flowers, Pots, Seeds, Soil, Fertilizer, Tools. Add, rename, reorder and nest sub-categories here.</Soon>}
          {view === 'customers' && <Soon icon="customers">Customer list with order history, addresses and lifetime value.</Soon>}
          {view === 'discounts' && <Soon icon="discount">Create coupons &amp; seasonal sales (Winter Sale, Buy 3 Get 1).</Soon>}
          {view === 'settings' && <Soon icon="settings">Store settings — delivery zones &amp; fees, payment gateways (Safepay, COD), nursery details.</Soon>}
        </div>
      </div>

      {/* customize panel */}
      <div className={`ov${customize ? ' show' : ''}`} onClick={(e) => { if (e.target.classList.contains('ov')) setCustomize(false); }}>
        <div className="modal">
          <h3 className="q">Customize panel <button onClick={() => setCustomize(false)}><Raw html={ICONS.close} /></button></h3>
          <div className="sub">Choose which sections to show or hide. Saved automatically on this device.</div>

          <div className="grp" style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 0 2px' }}>Dashboard sections</div>
          {DASH_WIDGETS.map((w) => (
            <Toggle key={w.k} label={w.label} sub={w.sub} on={vis[w.k]} onChange={() => setVisKey(w.k)} />
          ))}

          <div className="grp" style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '16px 0 2px' }}>Sidebar menu</div>
          {MENU_ITEMS.map((m) => (
            <Toggle key={m.k} label={m.label} on={vis[m.k]} onChange={() => setVisKey(m.k)} />
          ))}

          <div className="mfoot">
            <button className="btn btn-out" style={{ background: '#F4F6F0' }} onClick={() => setVis(DEFAULT_VIS)}>Reset to default</button>
            <button className="btn btn-pri" onClick={() => setCustomize(false)}>Done</button>
          </div>
        </div>
      </div>

      {/* add product modal */}
      <div className={`ov${modal ? ' show' : ''}`} onClick={(e) => { if (e.target.classList.contains('ov')) setModal(false); }}>
        <div className="modal">
          <h3 className="q">Add product <button onClick={() => setModal(false)}><Raw html={ICONS.close} /></button></h3>
          <div className="sub">Add a single plant or product to your catalog.</div>
          <div className="mrow"><div className="field"><label>Product name</label><input placeholder="e.g. Monstera Deliciosa" /></div></div>
          <div className="mrow two">
            <div className="field"><label>Category</label><select>{['Indoor', 'Outdoor', 'Flowers', 'Trees', 'Pots', 'Seeds', 'Soil', 'Fertilizer', 'Tools'].map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label>Scientific name (optional)</label><input placeholder="Monstera deliciosa" /></div>
          </div>
          <div className="mrow two">
            <div className="field"><label>Price (Rs)</label><input type="number" placeholder="1850" /></div>
            <div className="field"><label>Compare-at price (Rs)</label><input type="number" placeholder="2200" /></div>
          </div>
          <div className="mrow two">
            <div className="field"><label>Stock quantity</label><input type="number" placeholder="40" /></div>
            <div className="field"><label>Status</label><select><option>Active</option><option>Draft</option><option>Out of stock</option></select></div>
          </div>
          <div className="mrow"><div className="field"><label>Product photos</label><div className="upl"><Raw html={ICONS.upload} />Drag photos here or click to upload</div></div></div>
          <div className="mfoot">
            <button className="btn btn-out" style={{ background: '#F4F6F0' }} onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-pri" onClick={() => setModal(false)}>Save product</button>
          </div>
        </div>
      </div>

      <div className={`side-ov${drawer ? ' show' : ''}`} onClick={() => setDrawer(false)}></div>
    </div>
  );
}

function Soon({ icon, children }) {
  return <div className="pnl"><div className="ph-soon"><Raw html={ICONS[icon]} />{children}</div></div>;
}
