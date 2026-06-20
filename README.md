# Sabza — Plant Nursery Store (Next.js)

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
| `/admin`          | Admin panel — dashboard (stats, sales chart, low-stock, recent orders), Orders table, Products table, add-product modal |

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
