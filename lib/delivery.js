// Delivery rules shared by checkout, the server and the admin panel.
// Local delivery = road distance from the nursery × rate per km (with a minimum fare).
// The distance is worked out from the customer's address or phone location. Courier is a flat rate.

export const DEFAULT_DELIVERY = {
  rangePct: 0, // 0 = show one price; e.g. 20 = show "price – price+20%"
  // Nursery location (Shadab Road, opp. Nishtar Colony, 18 km Ferozepur Road). Set the exact pin in Admin → Delivery.
  origin: { lat: 31.445, lng: 74.354, label: 'Ahsan Ijaz Nursery Farm' },
  methods: [
    { id: 'bike', kind: 'local', name: 'inDrive — bike', desc: 'Fast delivery for small plants, pots & bags', eta: 'Same day · within a couple of hours', enabled: true, min: 700, perKm: 100, plants: true },
    { id: 'rickshaw', kind: 'local', name: 'inDrive — rickshaw', desc: 'Fast delivery for medium plants or several items', eta: 'Same day · within a couple of hours', enabled: true, min: 1000, perKm: 140, plants: true },
    { id: 'cargo', kind: 'local', name: 'inDrive — loader / cargo', desc: 'Trees, large palms & bulk orders', eta: 'Same day · within a couple of hours', enabled: true, min: 2500, perKm: 250, plants: true },
    { id: 'courier', kind: 'courier', name: 'Courier', desc: 'Economical delivery anywhere in Pakistan — small plants, seeds, pots, soil & fertilizer', eta: '2–3 days', enabled: true, flat: 300, perKg: 150, maxKg: 10, plants: true },
    { id: 'pickup', kind: 'pickup', name: 'Pick up from nursery', desc: 'Collect your order yourself — no delivery charge', eta: 'Ready the same day', enabled: true, plants: true },
  ],
  // Approximate road distance (km) from the nursery (Shadab Road, 18 km Ferozepur Road).
  areas: [
    { name: 'Nishtar Colony / Sherwani Town', km: 2 },
    { name: 'Green Town', km: 5 },
    { name: 'Kahna', km: 6 },
    { name: 'Township', km: 6 },
    { name: 'Model Town', km: 8 },
    { name: 'Faisal Town', km: 9 },
    { name: 'LDA City', km: 10 },
    { name: 'DHA Phase 5 / 6', km: 10 },
    { name: 'Garden Town', km: 10 },
    { name: 'Johar Town', km: 11 },
    { name: 'Walton / Cantt', km: 11 },
    { name: 'Askari', km: 11 },
    { name: 'DHA Phase 1 – 4', km: 12 },
    { name: 'Muslim Town', km: 12 },
    { name: 'Gulberg', km: 13 },
    { name: 'Allama Iqbal Town', km: 13 },
    { name: 'DHA Phase 7 – 9', km: 14 },
    { name: 'Wapda Town', km: 14 },
    { name: 'Shadman / Mall Road', km: 16 },
    { name: 'Lake City / Raiwind Road', km: 16 },
    { name: 'Valencia', km: 17 },
    { name: 'Samanabad / Gulshan-e-Ravi', km: 17 },
    { name: 'EME / Canal Road', km: 20 },
    { name: 'Bahria Town', km: 22 },
    { name: 'Walled City', km: 22 },
    { name: 'Shahdara', km: 28 },
  ],
};

const round10 = (n) => Math.round(n / 10) * 10;

const DEFAULT_ETA = { local: 'Same day · within a couple of hours', courier: '2–3 days', pickup: 'Ready the same day' };
/** Delivery time shown to customers (falls back by type for older saved settings). */
export const etaOf = (m) => (m && (m.eta || DEFAULT_ETA[m.kind])) || '';

/** Fare for a local method: max(minimum, km × rate). km = null → distance unknown. */
export function estimate(method, km, rangePct = 0) {
  if (!method || method.kind !== 'local') return null;
  if (km == null) return { low: method.min, high: null, unknown: true };
  const fare = Math.max(method.min || 0, round10(km * (method.perKm || 0)));
  return { low: fare, high: rangePct > 0 ? round10(fare * (1 + rangePct / 100)) : fare };
}

/** Straight-line distance in km. */
export function haversine(a, b) {
  const R = 6371, rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Pull "lat,lng" out of a pasted Google Maps link or plain coordinates. */
export function parseLatLng(text) {
  const m = String(text || '').match(/(?:@|q=|ll=|query=|!3d|^|\s)(-?\d{1,2}\.\d+)(?:,|!4d|\s+)\s*(-?\d{1,3}\.\d+)/);
  return m ? { lat: +m[1], lng: +m[2] } : null;
}

const rsn = (n) => `Rs ${Number(n).toLocaleString('en-PK')}`;
export const rsRange = (e) => (!e ? '' : e.unknown ? `from ${rsn(e.low)}` : e.high > e.low ? `${rsn(e.low)} – ${e.high.toLocaleString('en-PK')}` : rsn(e.low));

// ---- Products: live plant? weight? can it go by courier? ----
// Real products can set { w: kg, courier: true|false } explicitly; otherwise we estimate.
const NON_PLANT = /pot\b|pots|planter|seed|soil|fertili|tool|compost|cocopeat|npk|\bbag\b/i;
const NON_PLANT_CATS = ['Pots', 'Seeds', 'Soil', 'Fertilizer', 'Tools'];
const toNum = (v) => (typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^0-9.]/g, '')) || 0);

export function isPlantProduct(p) {
  if (p.cat) return !NON_PLANT_CATS.includes(p.cat);
  return !NON_PLANT.test(`${p.c || ''} ${p.n || ''}`);
}

/** { w: kg, courier: bool } for a product (plants over ~Rs 1,000, palms and trees are too big for courier). */
export function shippingInfo(p) {
  if (p.w != null && p.courier != null) return { w: +p.w, courier: Boolean(p.courier) };
  const text = `${p.cat || ''} ${p.c || ''} ${p.n || ''}`;
  if (!isPlantProduct(p)) {
    const kg = text.match(/(\d+(?:\.\d+)?)\s*kg/i);
    const w = kg ? +kg[1] : /seed/i.test(text) ? 0.2 : /pot|planter/i.test(text) ? 1.5 : 1;
    return { w, courier: true };
  }
  if (/palm|tree/i.test(text)) return { w: 10, courier: false };
  return toNum(p.p) <= 1000 ? { w: 2, courier: true } : { w: 5, courier: false };
}

/** Courier charge: rate for the first kg + per extra kg (rounded up). */
export const courierFee = (m, kg) => (m.flat || 0) + Math.ceil(Math.max(0, kg - 1)) * (m.perKg || 0);

/** Can this cart go by courier? → { ok, kg, fee, reason } */
export function courierCheck(m, items) {
  const kg = Math.round(items.reduce((s, it) => s + (it.w ?? 2) * it.q, 0) * 10) / 10;
  const big = items.find((it) => it.courier === false || (it.courier == null && it.plant !== false));
  if (big) return { ok: false, kg, reason: `${big.n} is too large for courier — choose inDrive` };
  if (!m.plants && items.some((it) => it.plant !== false)) return { ok: false, kg, reason: 'Courier is not available for live plants' };
  if (m.maxKg && kg > m.maxKg) return { ok: false, kg, reason: `Order is ${kg} kg — courier limit is ${m.maxKg} kg` };
  return { ok: true, kg, fee: courierFee(m, kg) };
}
