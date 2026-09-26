import { redirect } from 'next/navigation';
import AdminPanel from '@/components/admin/AdminPanel';
import { currentAdmin } from '@/lib/server/auth';
import { getPayments } from '@/lib/server/payments';
import { storageInfo } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin — Sabza', robots: { index: false } };

export default async function AdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  return <AdminPanel email={admin.email} initialPayments={await getPayments()} storage={storageInfo()} />;
}
