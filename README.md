# Ahsan Ijaz Nursery Farm — online store (Next.js)

A complete storefront + admin panel for a sell-only plant nursery, built with
**Next.js 14 (App Router) in plain JavaScript / JSX — no TypeScript.**

"Sabza" (سبزہ) is a placeholder brand — swap the name, logo and colours for your own.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

Build for production:

```bash
npm run build
npm start
```

## Pages

| Route             | What it is                                                              |
|-------------------|-------------------------------------------------------------------------|
| `/`               | Homepage — hero, categories, seasonal offers, product carousels, cities, care guides, FAQ |
| `/shop`           | Catalog with **working filters** (category, price, light, care, pet-safe), sort, chips, pagination, mobile filter drawer |
| `/product/[slug]` | Product detail — size/pot variants with live price, quantity, tabs, reviews, related, mobile sticky buy-bar |
| `/checkout`       | Cart + checkout — editable cart, free-delivery threshold (Rs 3,000), **Cash-on-Delivery-first** payments, order confirmation |
| `/admin`          | Admin panel (login required) — dashboard, Orders, Products, **Payment methods**, **Settings** (change login email/password) |
| `/admin/login`    | Admin sign-in |

## Project structure

```
sabza/
├─ app/
│  ├─ layout.jsx              root layout + fonts + metadata
│  ├─ globals.css             all styles (tokens + every page, namespaced)
│  ├─ page.jsx                homepage
│  ├─ shop/page.jsx           catalog + filters
│  ├─ product/[slug]/page.jsx product detail
│  ├─ checkout/page.jsx       cart + checkout
│  └─ admin/page.jsx          admin panel
├─ components/
│  ├─ Raw.jsx                 injects raw SVG markup (display:contents)
│  ├─ PlantArt.jsx            plant illustrations
│  ├─ StoreHeader.jsx         storefront header (promo + nav + search)
│  ├─ ProductCard.jsx         product card + SiteFooter + MiniFooter
│  └─ WhatsAppButton.jsx      floating WhatsApp button
└─ lib/
   ├─ data.js                 ALL product / order / dashboard data
   ├─ icons.js                UI icon SVG markup
   └─ plants.js               plant + category-tile SVG markup
```

## How the data works (and how to make it real)

Every product, order and dashboard number lives in **`lib/data.js`** as plain
arrays. The components already expect exactly these shapes, so wiring a real
backend means replacing those arrays with database reads — nothing in the UI
has to change.

Recommended next step (the stack we discussed):

- **PostgreSQL (Neon) + Drizzle ORM** for products / variants / orders / inventory
- **Auth.js** to protect `/admin`
- **Cloudinary** for product photos (replace the `<PlantArt/>` placeholders)
- **Payments:** Safepay (cards + JazzCash + Easypaisa + bank in one API) **+ Cash on Delivery**

Turn each page into a Server Component that reads from the DB, and pass the data
down to the existing client components for interactivity (filters, cart, etc.).

## Notes

- **JSX only** — there is no TypeScript anywhere in this project.
- The plant images are custom SVG placeholders. Drop in real photos when ready.
- SVG markup is injected through the small `<Raw/>` helper so the exact markup
  stays portable; swap for `<Image/>` / inline JSX whenever you like.
- All five screens started as standalone HTML mockups; this is the Next.js port.

## Admin login & payment methods

- Sign in at **`/admin/login`**. The initial login is the owner's email with the
  password they were given; change it any time from **Admin → Settings**
  (changing it signs out every other device).
- **Admin → Payment methods** controls what customers see at checkout:
  Cash on Delivery, JazzCash, Easypaisa, bank transfer (all major Pakistani banks),
  Raast, SadaPay, NayaPay, UPaisa, cards, or any custom method. Each method can be
  shown/hidden, edited, reordered or removed, and can hold several accounts that can
  be added, edited, replaced, hidden or removed.

### Where the settings are saved

| Hosting | What to do |
|---|---|
| **Vercel** | Vercel's disk is not permanent, so connect a free Redis database: Vercel dashboard → your project → **Storage** → **Upstash for Redis** → *Connect*. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`; redeploy. Until it's connected, admin changes can be lost on redeploy (the admin panel shows a warning). |
| **VPS / own server** | Nothing needed. Settings are saved to `data/store.json` (override the folder with `DATA_DIR`). Back that file up. The Redis option also works here if you prefer. |

Optional: set `AUTH_SECRET` (any long random string) to sign login sessions. Without it a
new key is generated on every build, which just means everyone is signed out after each deploy.

**Forgot the admin password?** Delete the `sabza:admin` key in Redis (or the `admin`
entry in `data/store.json`) — the login resets to the original credentials.

## Business details

Name, phone, WhatsApp, address, delivery fee and the order reference prefix all live in
**`lib/brand.js`** — change them there and the whole site updates.

## Leads & commission tracking

Every enquiry from the website is saved as a lead with a reference number (`AIN-1001`, …):

- **Orders** placed at checkout (customer details, items, total, payment method). The customer
  is then offered a pre-filled WhatsApp message containing the reference.
- **WhatsApp clicks** and **call clicks** — all contact buttons go through `/go/whatsapp` and
  `/go/call`, which record the lead and then open WhatsApp / the dialler. The WhatsApp message
  includes the reference so it can be matched to the lead.
- **Where the visitor came from** (Google, Instagram, Facebook, ads, `?ref=` / `utm_*` links) is
  remembered for 90 days and stored with each lead.

**Admin → Leads & orders** shows them by month. Set a lead to *confirmed*/*delivered* when it
turns into a sale (enter the sale amount for WhatsApp/call leads). Leads can't be deleted and
every change is kept in the lead's history. Set the agreed commission % there; the page shows
the month's sales value and commission, and **Export CSV** produces the monthly statement.

## Delivery

Customers pay the **product price** and a **separate delivery charge**:

- **Bike / rickshaw / loader (Lahore):** road distance from the nursery × rate per km, with a
  minimum fare (defaults: bike Rs 100/km min Rs 700, rickshaw Rs 140/km min Rs 1,000, loader
  Rs 250/km min Rs 2,500). The distance comes from the customer's phone location or address
  (OpenStreetMap by default; set `GOOGLE_MAPS_API_KEY` to use Google Maps instead), or from the
  area list as a fallback. The server recalculates the charge — the browser can't change it.
- **Pickup** from the nursery (no charge) and **courier to all Pakistan** (flat rate, non-plant items only).
- **Admin → Delivery**: edit methods and rates, set the nursery's exact location (paste a Google
  Maps link), edit the area list. Enter the **actual rider fare** on each order and the page shows
  whether the estimates are too high or too low.

## Order alerts

**Admin → Order alerts** — the nursery can switch on any of:

| Channel | Cost | Vercel environment variables |
|---|---|---|
| Telegram | Free | `TELEGRAM_BOT_TOKEN` |
| Email (Resend) | Free tier | `RESEND_API_KEY`, optional `ALERT_FROM_EMAIL` |
| WhatsApp (Meta Cloud API) | ~Rs 3–4 per alert | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` + approved template `new_order_alert` |

Step-by-step setup for each is shown on that page, with a **Send test** button. Alert results are
saved in each order's history.
