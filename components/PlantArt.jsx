'use client';
import Raw from './Raw';
import { PLANTS } from '@/lib/plants';
export default function PlantArt({ name, className }) {
  return <Raw className={className} html={PLANTS[name] || PLANTS.foliage} />;
}
