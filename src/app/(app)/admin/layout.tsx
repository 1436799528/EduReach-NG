import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionUser, roleAtLeast } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getSessionUser();
  if (!session || !roleAtLeast(session.user.role, 'MODERATOR')) notFound();

  const isAdmin = roleAtLeast(session.user.role, 'ADMIN');

  return (
    <div>
      <div className="page-head">
        <h1 style={{ fontSize: '1.8rem' }}>Administration</h1>
        <div className="pill-list mt-1">
          <Link className="pill" href="/admin">Overview</Link>
          {isAdmin ? <Link className="pill" href="/admin/announcements">Announcements</Link> : null}
          {isAdmin ? <Link className="pill" href="/admin/cutoffs">Cut-off marks</Link> : null}
          <Link className="pill" href="/admin/verification">Verification queue</Link>
          {isAdmin ? <Link className="pill" href="/admin/users">Users</Link> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
