// Plant / product illustrations (placeholders for real product photos).
export const PLANTS = {
  foliage: '<svg viewBox="0 0 100 100" fill="none"><path d="M50 92c0-30-2-46-22-62 4 36 10 50 22 62Z" fill="#5DA13B"/><path d="M50 92c0-34 5-52 27-66-5 38-14 52-27 66Z" fill="#7CC043"/><path d="M50 92c0-22-8-36-1-58-14 18-12 38 1 58Z" fill="#4A8B2F"/><rect x="34" y="88" width="32" height="5" rx="2.5" fill="#2C5C20"/></svg>',
  snake: '<svg viewBox="0 0 100 100" fill="none"><path d="M44 90c-3-44 0-58 4-72 3 16 4 30 2 72Z" fill="#5DA13B"/><path d="M54 90c2-40 6-52 12-64-2 18-5 34-12 64Z" fill="#7CC043"/><path d="M38 90c-4-32-2-44 0-56 0 16 2 30 2 56Z" fill="#4A8B2F"/><rect x="33" y="86" width="34" height="6" rx="3" fill="#A85A28"/></svg>',
  palm: '<svg viewBox="0 0 100 100" fill="none"><path d="M50 90c0-30 0-44 2-58" stroke="#4A8B2F" stroke-width="3"/><path d="M52 34C40 26 28 28 22 36c10-2 20 2 30 10ZM52 34c12-8 24-6 30 2-10-2-20 2-30 10ZM52 36c-8-10-8-22-2-30 0 10 4 20 8 32ZM52 36c8-12 18-16 26-12-10 2-18 8-24 16Z" fill="#7CC043"/><rect x="36" y="86" width="30" height="5" rx="2.5" fill="#A85A28"/></svg>',
  flower: '<svg viewBox="0 0 100 100" fill="none"><path d="M50 90c0-26 0-40 0-52" stroke="#4A8B2F" stroke-width="3"/><circle cx="50" cy="32" r="7" fill="#F39513"/><circle cx="42" cy="26" r="6" fill="#E85D8A"/><circle cx="58" cy="26" r="6" fill="#E85D8A"/><circle cx="42" cy="40" r="6" fill="#E85D8A"/><circle cx="58" cy="40" r="6" fill="#E85D8A"/><circle cx="36" cy="56" r="6" fill="#7CC043"/><circle cx="64" cy="56" r="6" fill="#7CC043"/><rect x="36" y="86" width="30" height="5" rx="2.5" fill="#A85A28"/></svg>',
  zz: '<svg viewBox="0 0 100 100" fill="none"><path d="M50 90c-2-34-6-46-16-58 8 8 14 20 16 36 2-16 8-28 16-36-10 12-14 24-16 58Z" fill="#5DA13B"/><circle cx="40" cy="48" r="6" fill="#7CC043"/><circle cx="60" cy="48" r="6" fill="#7CC043"/><circle cx="44" cy="36" r="5" fill="#7CC043"/><circle cx="56" cy="36" r="5" fill="#7CC043"/><rect x="34" y="86" width="32" height="5" rx="2.5" fill="#2C5C20"/></svg>',
  pot: '<svg viewBox="0 0 100 100" fill="none"><path d="M28 42h44l-7 44H35z" fill="#C97B3D"/><path d="M24 36h52v8H24z" fill="#A85A28"/></svg>',
  bag: '<svg viewBox="0 0 100 100" fill="none"><path d="M32 30h36l4 56H28z" fill="#8C6B45"/><path d="M32 30c0-6 6-10 18-10s18 4 18 10" fill="#A07C52"/><rect x="40" y="46" width="20" height="20" rx="3" fill="#EDE3D3"/></svg>',
  tray: '<svg viewBox="0 0 100 100" fill="none"><rect x="22" y="40" width="56" height="34" rx="3" fill="#333"/><g fill="#555"><circle cx="32" cy="50" r="3"/><circle cx="44" cy="50" r="3"/><circle cx="56" cy="50" r="3"/><circle cx="68" cy="50" r="3"/><circle cx="32" cy="62" r="3"/><circle cx="44" cy="62" r="3"/><circle cx="56" cy="62" r="3"/><circle cx="68" cy="62" r="3"/></g></svg>',
};

// Category tile icon markup (kept inline so each tile keeps its own colour).
export const TILE_ICONS = {
  Indoor: '<svg viewBox="0 0 24 24" fill="none" stroke="#5DA13B" stroke-width="2"><path d="M4 19V5a8 8 0 018 8 8 8 0 018-8v14" stroke-linejoin="round"/></svg>',
  Outdoor: '<svg viewBox="0 0 24 24" fill="none" stroke="#E0A21A" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4" stroke-linecap="round"/></svg>',
  Trees: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E8E4F" stroke-width="2"><path d="M12 2 5 12h4l-3 5h12l-3-5h4L12 2ZM12 17v5" stroke-linejoin="round"/></svg>',
  Flowers: '<svg viewBox="0 0 24 24" fill="none" stroke="#E85D8A" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 4a3 3 0 010 6M12 20a3 3 0 010-6M4 12a3 3 0 016 0M20 12a3 3 0 01-6 0"/></svg>',
  Pots: '<svg viewBox="0 0 24 24" fill="none" stroke="#C97B3D" stroke-width="2"><path d="M5 8h14l-2 12H7L5 8Z" stroke-linejoin="round"/><path d="M4 5h16v3H4z"/></svg>',
  Seeds: '<svg viewBox="0 0 24 24" fill="none" stroke="#8A5CC4" stroke-width="2"><path d="M12 3c4 4 4 10 0 14-4-4-4-10 0-14ZM12 17v4" stroke-linejoin="round"/></svg>',
  Soil: '<svg viewBox="0 0 24 24" fill="none" stroke="#8C6B45" stroke-width="2"><path d="M5 9h14l-1 11H6L5 9Z" stroke-linejoin="round"/><path d="M9 9 8 5M15 9l1-4" stroke-linecap="round"/></svg>',
  Fertilizer: '<svg viewBox="0 0 24 24" fill="none" stroke="#3E84C4" stroke-width="2"><path d="M7 8h10l-1 12H8L7 8Z" stroke-linejoin="round"/><path d="M9 8a3 3 0 016 0"/></svg>',
  Tools: '<svg viewBox="0 0 24 24" fill="none" stroke="#2E9E8A" stroke-width="2"><path d="M14 4l6 6-3 3-6-6zM11 7 4 14v6h6l7-7" stroke-linejoin="round"/></svg>',
};

export const TILE_BG = {
  Indoor: '#E4F1D6', Outdoor: '#FCF1D6', Trees: '#DBF0DE', Flowers: '#FBE0EC',
  Pots: '#FCE4D6', Seeds: '#EFE3FB', Soil: '#EDE3D3', Fertilizer: '#DEEAFB', Tools: '#D9F0EC',
};
