import { BRAND } from '@/lib/brand';

// Sprout mark: two leaves rising from a terracotta soil line.
export function SproutMark({ size = 32, stem = '#1E4D2B', light = false }) {
  const dark = light ? '#FFFFFF' : stem;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <path d="M32 53V30" stroke={dark} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M31.5 36C21 36 13.5 29 12.5 17.5 24 17.5 31 24.5 31.5 36Z" fill={light ? '#A9D78A' : '#5FA83B'} />
      <path d="M32.5 30C33.2 17.5 41 9.5 52.5 9.5 52 21.5 44 29.5 32.5 30Z" fill={dark} />
      <path d="M13 55.5Q32 47 51 55.5" stroke="#C8693A" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Mark + two-line wordmark. `light` = for dark backgrounds. */
export default function Logo({ light = false, size = 34, compact = false }) {
  return (
    <span className={`logo${light ? ' light' : ''}`} aria-label={BRAND.name}>
      <SproutMark size={size} light={light} />
      <span className="lt">
        <b>{BRAND.line1}</b>
        {!compact && <small>{BRAND.line2}</small>}
      </span>
    </span>
  );
}
