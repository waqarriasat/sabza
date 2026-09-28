// Address → coordinates → road distance from the nursery.
// Uses Google Maps if GOOGLE_MAPS_API_KEY is set (most accurate for Pakistani addresses);
// otherwise free OpenStreetMap services (Nominatim for addresses, OSRM for road distance).
// If routing is unavailable, falls back to straight-line distance × 1.3.
import { haversine } from '../delivery';

const GOOGLE = process.env.GOOGLE_MAPS_API_KEY;
const NOMINATIM = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';
const OSRM = process.env.OSRM_URL || 'https://router.project-osrm.org';
const UA = `AhsanIjazNurseryWebsite/1.0 (+${process.env.SITE_URL || 'https://sabza.vercel.app'})`;
// Rough box around greater Lahore, to keep address matches local.
const LAHORE = { south: 31.2, west: 74.0, north: 31.75, east: 74.65 };

const cache = new Map();
const remember = (k, v) => { if (cache.size > 2000) cache.clear(); cache.set(k, v); return v; };

async function getJson(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { 'User-Agent': UA, ...(opts.headers || {}) }, signal: AbortSignal.timeout(8000), cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Find an address in Lahore. Returns { lat, lng, label } or null. */
export async function geocode(address) {
  const q = String(address || '').trim().slice(0, 200);
  if (q.length < 3) return null;
  const key = `g:${q.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key);
  const query = /lahore/i.test(q) ? q : `${q}, Lahore`;
  try {
    if (GOOGLE) {
      const b = `${LAHORE.south},${LAHORE.west}|${LAHORE.north},${LAHORE.east}`;
      const j = await getJson(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&bounds=${b}&components=country:PK&key=${GOOGLE}`);
      const r = j.results?.[0];
      return remember(key, r ? { lat: r.geometry.location.lat, lng: r.geometry.location.lng, label: r.formatted_address } : null);
    }
    const vb = `${LAHORE.west},${LAHORE.north},${LAHORE.east},${LAHORE.south}`;
    const j = await getJson(`${NOMINATIM}/search?format=json&limit=1&countrycodes=pk&viewbox=${vb}&bounded=1&q=${encodeURIComponent(query)}`);
    const r = j?.[0];
    return remember(key, r ? { lat: +r.lat, lng: +r.lon, label: r.display_name } : null);
  } catch {
    return null;
  }
}

/** Road distance in km between two points. */
export async function roadKm(from, to) {
  const key = `r:${from.lat.toFixed(4)},${from.lng.toFixed(4)}:${to.lat.toFixed(4)},${to.lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key);
  try {
    if (GOOGLE) {
      const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE, 'X-Goog-FieldMask': 'routes.distanceMeters' },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
          destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
          travelMode: 'TWO_WHEELER',
        }),
        signal: AbortSignal.timeout(8000),
      });
      const j = await res.json();
      const m = j.routes?.[0]?.distanceMeters;
      if (m) return remember(key, { km: +(m / 1000).toFixed(1), how: 'road' });
    } else {
      const j = await getJson(`${OSRM}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`);
      const m = j.routes?.[0]?.distance;
      if (m) return remember(key, { km: +(m / 1000).toFixed(1), how: 'road' });
    }
  } catch {
    // fall through to straight-line estimate
  }
  return { km: +(haversine(from, to) * 1.3).toFixed(1), how: 'approx' };
}

export const inLahore = (p) => p.lat > LAHORE.south && p.lat < LAHORE.north && p.lng > LAHORE.west && p.lng < LAHORE.east;
