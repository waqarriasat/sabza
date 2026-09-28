// ---------------------------------------------------------------------------
// Single source of data for the demo. Replace these arrays with real database
// queries (Drizzle + Postgres) when you wire up the backend — the components
// already expect exactly these shapes.
// ---------------------------------------------------------------------------

// Quick-access category tiles (homepage)
export const TILES = ['Indoor', 'Outdoor', 'Trees', 'Flowers', 'Pots', 'Seeds', 'Soil', 'Fertilizer', 'Tools'];

// Seasonal offer cards (homepage)
export const OFFERS = [
  { cls: 'g', icon: 'percent', title: 'Winter Sale', sub: 'Up to 40% Off', small: 'Indoor Plants' },
  { cls: 'y', icon: 'gift', title: 'Buy 3 Get 1', sub: 'Bundle Deal', small: 'Succulents' },
  { cls: 'p', icon: 'leaf', title: 'New Arrivals', sub: 'Fresh Stock', small: 'Just added' },
];

// Homepage product carousels
export const SECTIONS = [
  {
    t: 'Trending This Week', emoji: '🔥', bg: '#FBE7E0', link: 'View All',
    items: [
      { n: 'Monstera Deliciosa', c: 'Indoor Plants', p: '1,850', w: '2,200', d: '16%', r: 4.8, ct: 12, a: 'foliage' },
      { n: 'Snake Plant (Sansevieria)', c: 'Indoor Plants', p: '950', w: '1,200', d: '21%', r: 4.7, ct: 9, a: 'snake' },
      { n: 'Areca Palm', c: 'Indoor Plants', p: '2,200', w: '2,800', d: '21%', r: 4.6, ct: 7, a: 'palm' },
      { n: 'Ixora (Jungle Geranium)', c: 'Flower Plants', p: '450', w: '650', d: '31%', r: 4.7, ct: 3, a: 'flower' },
      { n: '128 Cell Seedling Tray', c: 'Pots & Planters', p: '275', w: '350', d: '21%', r: 5.0, ct: 1, a: 'tray' },
    ],
  },
  {
    t: 'Flower Plants', emoji: '🌸', bg: '#FBE0EC', link: 'Shop Flower Plants',
    items: [
      { n: 'Jatropha (Jatropha integerrima)', c: 'Flower Plants', p: '350', w: '650', d: '46%', r: 4.7, ct: 3, a: 'flower' },
      { n: 'Night Jasmine (Raat ki Rani)', c: 'Flower Plants', p: '350', w: '550', d: '36%', r: 4.7, ct: 3, a: 'flower' },
      { n: 'Pinwheel Plant (Chandni)', c: 'Flower Plants', p: '350', w: '550', d: '36%', r: 4.7, ct: 3, a: 'flower' },
      { n: 'Motia (Arabian Jasmine)', c: 'Flower Plants', p: '250', w: '450', d: '44%', r: 4.6, ct: 5, a: 'flower' },
      { n: 'Hybrid Rose Plant', c: 'Flower Plants', p: '400', w: '550', d: '27%', r: 4.8, ct: 6, a: 'flower' },
    ],
  },
  {
    t: 'Low Maintenance', emoji: '🌿', bg: '#E4F1D6', link: 'Explore',
    items: [
      { n: 'ZZ Plant (Zamioculcas)', c: 'Indoor Plants', p: '1,400', w: '1,800', d: '22%', r: 4.7, ct: 6, a: 'zz' },
      { n: 'Golden Pothos (Money Plant)', c: 'Indoor Plants', p: '650', w: '850', d: '24%', r: 4.7, ct: 8, a: 'foliage' },
      { n: 'Spider Plant (Chlorophytum)', c: 'Ground Covers', p: '100', w: '150', d: '33%', r: 4.7, ct: 3, a: 'snake' },
      { n: 'Rubber Plant (Ficus elastica)', c: 'Indoor Plants', p: '1,600', w: '2,100', d: '24%', r: 4.6, ct: 4, a: 'foliage' },
      { n: 'Copernicia Palm', c: 'Outdoor Plants', p: '13,500', w: '18,000', d: '25%', r: 4.7, ct: 3, a: 'palm' },
    ],
  },
  {
    t: 'Pots & Planters', emoji: '🪴', bg: '#FCE4D6', link: 'Find Gifts',
    items: [
      { n: 'Terracotta Pot 8"', c: 'Clay Pots', p: '320', w: '450', d: '29%', r: 4.8, ct: 5, a: 'pot' },
      { n: '200 Cell Seedling Tray', c: 'Plastic Pots', p: '300', w: '370', d: '19%', r: 5.0, ct: 1, a: 'tray' },
      { n: 'Ceramic Glazed Pot 6"', c: 'Ceramic Pots', p: '890', w: '1,150', d: '23%', r: 4.7, ct: 4, a: 'pot' },
      { n: '72 Cell Seedling Tray', c: 'Plastic Pots', p: '250', w: '300', d: '17%', r: 5.0, ct: 1, a: 'tray' },
      { n: 'Stainless Steel Planter 22"', c: 'Steel Planters', p: '6,900', w: '7,500', d: '8%', r: 4.8, ct: 5, a: 'pot' },
    ],
  },
  {
    t: 'Seeds & Soil', emoji: '🌱', bg: '#E4F1D6', link: 'Shop Seeds',
    items: [
      { n: 'Teddy Bear Sunflower Seeds', c: 'Flower Seeds', p: '450', w: '550', d: '18%', r: 5.0, ct: 6, a: 'bag' },
      { n: 'Rosemary Seeds (Salvia)', c: 'Herb Seeds', p: '550', w: '650', d: '15%', r: 4.8, ct: 9, a: 'bag' },
      { n: 'Vermicompost 5 kg', c: 'Organic Soil', p: '650', w: '750', d: '13%', r: 4.7, ct: 3, a: 'bag' },
      { n: 'Cocopeat 1 kg Block', c: 'Potting Soil', p: '350', w: '450', d: '22%', r: 4.7, ct: 3, a: 'bag' },
      { n: 'NPK Fertilizer (Imported)', c: 'NPK Fertilizers', p: '1,550', w: '2,500', d: '38%', r: 4.5, ct: 4, a: 'bag' },
    ],
  },
];

export const LAHORE_AREAS = ['DHA', 'Gulberg', 'Johar Town', 'Model Town', 'Bahria Town', 'Wapda Town', 'Cantt', 'Shadab Colony'];

// Catalog products (shop page filters operate on this)
export const CATALOG = [
  { n: 'Monstera Deliciosa', cat: 'Indoor', p: 1850, w: 2200, light: 'Bright', care: 'Easy', pet: false, r: 4.8, a: 'foliage', pop: 99, slug: 'monstera-deliciosa' },
  { n: 'Snake Plant (Sansevieria)', cat: 'Indoor', p: 950, w: 1200, light: 'Low', care: 'Easy', pet: false, r: 4.7, a: 'snake', pop: 95, slug: 'snake-plant' },
  { n: 'ZZ Plant', cat: 'Indoor', p: 1400, w: 1800, light: 'Low', care: 'Easy', pet: false, r: 4.7, a: 'zz', pop: 88, slug: 'zz-plant' },
  { n: 'Areca Palm', cat: 'Indoor', p: 2200, w: 2800, light: 'Bright', care: 'Moderate', pet: true, r: 4.6, a: 'palm', pop: 80, slug: 'areca-palm' },
  { n: 'Golden Pothos (Money Plant)', cat: 'Indoor', p: 650, w: 850, light: 'Low', care: 'Easy', pet: false, r: 4.7, a: 'foliage', pop: 92, slug: 'golden-pothos' },
  { n: 'Rubber Plant', cat: 'Indoor', p: 1600, w: 2100, light: 'Bright', care: 'Easy', pet: false, r: 4.6, a: 'foliage', pop: 75, slug: 'rubber-plant' },
  { n: 'Spider Plant', cat: 'Indoor', p: 100, w: 150, light: 'Bright', care: 'Easy', pet: true, r: 4.7, a: 'snake', pop: 70, slug: 'spider-plant' },
  { n: 'Jatropha', cat: 'Flowers', p: 350, w: 650, light: 'Bright', care: 'Moderate', pet: true, r: 4.7, a: 'flower', pop: 78, slug: 'jatropha' },
  { n: 'Motia (Arabian Jasmine)', cat: 'Flowers', p: 250, w: 450, light: 'Bright', care: 'Moderate', pet: true, r: 4.6, a: 'flower', pop: 82, slug: 'motia' },
  { n: 'Hybrid Rose Plant', cat: 'Flowers', p: 400, w: 550, light: 'Bright', care: 'Fussy', pet: true, r: 4.8, a: 'flower', pop: 85, slug: 'hybrid-rose' },
  { n: 'Ixora (Jungle Geranium)', cat: 'Flowers', p: 450, w: 650, light: 'Bright', care: 'Moderate', pet: true, r: 4.7, a: 'flower', pop: 68, slug: 'ixora' },
  { n: 'Copernicia Palm', cat: 'Outdoor', p: 13500, w: 18000, light: 'Bright', care: 'Moderate', pet: true, r: 4.7, a: 'palm', pop: 55, slug: 'copernicia-palm' },
  { n: 'Terracotta Pot 8"', cat: 'Pots', p: 320, w: 450, light: '-', care: '-', pet: true, r: 4.8, a: 'pot', pop: 60, slug: 'terracotta-pot-8' },
  { n: 'Ceramic Glazed Pot 6"', cat: 'Pots', p: 890, w: 1150, light: '-', care: '-', pet: true, r: 4.7, a: 'pot', pop: 58, slug: 'ceramic-pot-6' },
  { n: 'Vermicompost 5 kg', cat: 'Soil', p: 650, w: 750, light: '-', care: '-', pet: true, r: 4.7, a: 'bag', pop: 64, slug: 'vermicompost-5kg' },
  { n: 'Cocopeat 1 kg Block', cat: 'Soil', p: 350, w: 450, light: '-', care: '-', pet: true, r: 4.7, a: 'bag', pop: 62, slug: 'cocopeat-1kg' },
  { n: 'Teddy Bear Sunflower Seeds', cat: 'Seeds', p: 450, w: 550, light: '-', care: '-', pet: true, r: 5.0, a: 'bag', pop: 72, slug: 'sunflower-seeds' },
  { n: 'NPK Fertilizer (Imported)', cat: 'Fertilizer', p: 1550, w: 2500, light: '-', care: '-', pet: true, r: 4.5, a: 'bag', pop: 50, slug: 'npk-fertilizer' },
];

export const FILTER_CATS = ['Indoor', 'Outdoor', 'Flowers', 'Pots', 'Seeds', 'Soil', 'Fertilizer'];
export const FILTER_LIGHT = ['Low', 'Bright'];
export const FILTER_CARE = ['Easy', 'Moderate', 'Fussy'];

// Product detail (single example — Monstera)
export const PRODUCT = {
  name: 'Monstera Deliciosa',
  sci: 'Monstera deliciosa · Swiss Cheese Plant',
  cat: 'Indoor Plants · Foliage',
  rating: 4.8,
  reviews: 12,
  art: 'foliage',
  desc: "One of the most loved indoor plants — those iconic split leaves bring instant jungle character to any room. Hardy, fast-growing and forgiving, it's a brilliant statement plant for beginners. Grown and acclimatised at our Lahore nursery so it settles into your home without the sulk.",
  sizes: [
    { id: 's', label: 'Small', sub: '8" pot', price: 1850, was: 2200 },
    { id: 'm', label: 'Medium', sub: '10" pot', price: 2950, was: 3600 },
    { id: 'l', label: 'Large', sub: '12" pot', price: 4500, was: 5500 },
  ],
  pots: [
    { id: 'nursery', label: 'Nursery pot', sub: 'Included', add: 0 },
    { id: 'ceramic', label: 'Ceramic pot', sub: '+ Rs 800', add: 800 },
  ],
  facts: [
    { icon: 'sun', label: 'Light', val: 'Bright, indirect' },
    { icon: 'drop', label: 'Water', val: 'Once a week' },
    { icon: 'leaf', label: 'Care level', val: 'Easy' },
    { icon: 'pin', label: 'Mature height', val: 'Up to 6 ft' },
    { icon: 'height', label: 'Air purifying', val: 'Yes' },
    { icon: 'paw', label: 'Pet safe', val: 'No — keep away' },
  ],
  specs: [
    ['Botanical name', 'Monstera deliciosa'], ['Common name', 'Swiss Cheese Plant'],
    ['Plant type', 'Foliage / climber'], ['Mature height', 'Up to 6 ft indoors'],
    ['Light', 'Bright, indirect'], ['Watering', 'Once a week'],
    ['Care level', 'Easy'], ['Pet friendly', 'No (toxic if eaten)'], ['Pot included', 'Yes — nursery grow-pot'],
  ],
  related: [
    { n: 'Snake Plant (Sansevieria)', c: 'Indoor Plants', p: '950', w: '1,200', d: '21%', a: 'snake' },
    { n: 'ZZ Plant (Zamioculcas)', c: 'Indoor Plants', p: '1,400', w: '1,800', d: '22%', a: 'zz' },
    { n: 'Areca Palm', c: 'Indoor Plants', p: '2,200', w: '2,800', d: '21%', a: 'palm' },
    { n: 'Golden Pothos (Money Plant)', c: 'Indoor Plants', p: '650', w: '850', d: '24%', a: 'foliage' },
    { n: 'Rubber Plant', c: 'Indoor Plants', p: '1,600', w: '2,100', d: '24%', a: 'foliage' },
  ],
};


// ---- Admin data ----
export const ADMIN_STATS = [
  { icon: 'revenue', bg: '#E1F0D4', color: '#4A8B2F', label: 'Revenue today', val: 'Rs 84,500', tr: 'up', note: '12% vs yesterday' },
  { icon: 'orders', bg: '#DCE9F8', color: '#2C5E96', label: 'Orders today', val: '37', tr: 'up', note: '8 new this hour' },
  { icon: 'leaf', bg: '#ECE2F8', color: '#6A3FA0', label: 'Active products', val: '248', tr: 'up', note: '6 added this week' },
  { icon: 'warning', bg: '#FCEBD2', color: '#B5710C', label: 'Low stock', val: '6', tr: 'down', note: 'needs restock' },
];
export const CHART = [
  { d: 'Mon', v: 42 }, { d: 'Tue', v: 55 }, { d: 'Wed', v: 38 }, { d: 'Thu', v: 61 },
  { d: 'Fri', v: 48 }, { d: 'Sat', v: 72 }, { d: 'Sun', v: 67 },
];
export const LOW_STOCK = [
  { n: 'Fiddle Leaf Fig', a: 'foliage', s: 3 }, { n: 'Areca Palm', a: 'palm', s: 4 },
  { n: 'Terracotta Pot 8"', a: 'pot', s: 2 }, { n: 'Vermicompost 5kg', a: 'bag', s: 5 },
  { n: 'Hybrid Rose Plant', a: 'flower', s: 4 }, { n: 'Snake Plant', a: 'snake', s: 6 },
];
export const ADMIN_ORDERS = [
  { id: '#SBZ-48213', c: 'Ayesha Khan', city: 'Lahore', items: 3, total: 5650, pay: 'COD', st: 'Pending', d: 'Today, 2:14 PM' },
  { id: '#SBZ-48212', c: 'Hamza Raza', city: 'Karachi', items: 1, total: 1850, pay: 'JazzCash', st: 'Confirmed', d: 'Today, 1:02 PM' },
  { id: '#SBZ-48211', c: 'Sana Malik', city: 'Islamabad', items: 5, total: 8900, pay: 'COD', st: 'Packed', d: 'Today, 11:48 AM' },
  { id: '#SBZ-48210', c: 'Bilal Ahmed', city: 'Rawalpindi', items: 2, total: 2750, pay: 'Easypaisa', st: 'Delivered', d: 'Yesterday' },
  { id: '#SBZ-48209', c: 'Fatima Noor', city: 'Faisalabad', items: 1, total: 13500, pay: 'Card', st: 'Delivered', d: 'Yesterday' },
  { id: '#SBZ-48208', c: 'Usman Tariq', city: 'Multan', items: 4, total: 3200, pay: 'COD', st: 'Delivered', d: '2 days ago' },
  { id: '#SBZ-48207', c: 'Zara Sheikh', city: 'Lahore', items: 2, total: 1900, pay: 'COD', st: 'Cancelled', d: '2 days ago' },
];
export const ADMIN_PRODUCTS = [
  { n: 'Monstera Deliciosa', sci: 'Monstera deliciosa', cat: 'Indoor', p: 1850, stock: 42, st: 'Active', a: 'foliage' },
  { n: 'Snake Plant', sci: 'Sansevieria', cat: 'Indoor', p: 950, stock: 88, st: 'Active', a: 'snake' },
  { n: 'Areca Palm', sci: 'Dypsis lutescens', cat: 'Indoor', p: 2200, stock: 4, st: 'Active', a: 'palm' },
  { n: 'Fiddle Leaf Fig', sci: 'Ficus lyrata', cat: 'Indoor', p: 3500, stock: 3, st: 'Active', a: 'foliage' },
  { n: 'Hybrid Rose Plant', sci: 'Rosa hybrid', cat: 'Flowers', p: 400, stock: 4, st: 'Active', a: 'flower' },
  { n: 'Terracotta Pot 8"', sci: '—', cat: 'Pots', p: 320, stock: 2, st: 'Active', a: 'pot' },
  { n: 'Vermicompost 5 kg', sci: '—', cat: 'Soil', p: 650, stock: 5, st: 'Active', a: 'bag' },
  { n: 'Copernicia Palm', sci: 'Copernicia', cat: 'Outdoor', p: 13500, stock: 11, st: 'Active', a: 'palm' },
  { n: 'Winter Petunias', sci: 'Petunia', cat: 'Flowers', p: 300, stock: 0, st: 'Out of stock', a: 'flower' },
  { n: 'Cocopeat 1 kg', sci: '—', cat: 'Soil', p: 350, stock: 60, st: 'Draft', a: 'bag' },
];

export const fmt = (n) => 'Rs. ' + n.toLocaleString('en-PK');
export const stars = (r) => { let s = ''; for (let i = 1; i <= 5; i++) s += i <= Math.round(r) ? '★' : '☆'; return s; };
