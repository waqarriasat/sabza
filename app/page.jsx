import HomePage from '@/components/HomePage';
import { getPaySummary } from '@/lib/server/paysummary';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <HomePage pay={await getPaySummary()} />;
}
