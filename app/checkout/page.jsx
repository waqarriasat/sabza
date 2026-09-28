import Checkout from '@/components/Checkout';
import { getPayments } from '@/lib/server/payments';
import { publicPayments } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  return <Checkout payments={publicPayments(await getPayments())} />;
}
