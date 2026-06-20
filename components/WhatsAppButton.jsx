'use client';
import Raw from './Raw';
import { ICONS } from '@/lib/icons';
export default function WhatsAppButton() {
  return (
    <a className="wa" href="#" aria-label="WhatsApp"><Raw html={ICONS.whatsapp} /></a>
  );
}
