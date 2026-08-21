import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = getSessionUser();
  if (!session) redirect('/login');

  return (
    <AppShell session={session}>
      {!session.user.email_verified_at ? (
        <div className="notice notice--info mb-2 no-print">
          <strong>One quick step:</strong> verify your email so you never lose access to your account.{' '}
          <Link href="/verify-email">Verify my email</Link>
        </div>
      ) : null}
      {children}
    </AppShell>
  );
}
