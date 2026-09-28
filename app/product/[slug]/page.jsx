import ProductPage from '@/components/ProductPage';
import { getPaySummary } from '@/lib/server/paysummary';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <ProductPage pay={await getPaySummary()} />;
}
