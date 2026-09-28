import Checkout from '@/components/Checkout';
import { getPayments } from '@/lib/server/payments';
import { publicPayments } from '@/lib/payments';
import { getDelivery } from '@/lib/server/delivery';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const d = await getDelivery();
  const delivery = { rangePct: d.rangePct, areas: d.areas, methods: d.methods.filter((m) => m.enabled) };
  return <Checkout payments={publicPayments(await getPayments())} delivery={delivery} />;
}
