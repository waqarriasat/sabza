'use client';
import { useEffect } from 'react';

// Remembers where a visitor first came from (Google, Instagram, an ad, ?ref=partner …)
// in a cookie for 90 days, so any later order or WhatsApp click can be credited.
export default function Attribution() {
  useEffect(() => {
    try {
      if (document.cookie.split('; ').some((c) => c.startsWith('ain_src='))) return;
      const q = new URLSearchParams(location.search);
      let r = '';
      try { r = document.referrer ? new URL(document.referrer).hostname : ''; } catch {}
      if (r === location.hostname) r = '';
      const src = {
        s: q.get('utm_source') || '', m: q.get('utm_medium') || '', c: q.get('utm_campaign') || '',
        ref: q.get('ref') || '', r, l: location.pathname + location.search, t: new Date().toISOString(),
      };
      document.cookie = `ain_src=${encodeURIComponent(JSON.stringify(src))}; path=/; max-age=${90 * 86400}; samesite=lax`;
    } catch {}
  }, []);
  return null;
}
