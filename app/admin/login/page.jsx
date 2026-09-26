import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { currentAdmin } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin login — Sabza', robots: { index: false } };

export default async function LoginPage() {
  if (await currentAdmin()) redirect('/admin');
  return <LoginForm />;
}
