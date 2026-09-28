'use client';
import { usePathname } from 'next/navigation';
import Raw from './Raw';
import { ICONS } from '@/lib/icons';

export default function WhatsAppButton({ item }) {
  const path = usePathname();
  const href = `/go/whatsapp?src=float&page=${encodeURIComponent(path)}${item ? `&item=${encodeURIComponent(item)}` : ''}`;
  return (
    <a className="wa" href={href} rel="nofollow" aria-label="Chat on WhatsApp"><Raw html={ICONS.whatsapp} /></a>
  );
}
