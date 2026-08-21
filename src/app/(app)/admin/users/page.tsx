import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser, listUsers, roleAtLeast } from '@/lib/auth';
import { UsersTable } from '@/components/admin/users-table';

export const metadata: Metadata = { title: 'Admin · Users' };
export const dynamic = 'force-dynamic';

export default function AdminUsersPage() {
  const session = getSessionUser();
  if (!session || !roleAtLeast(session.user.role, 'ADMIN')) redirect('/dashboard');

  return (
    <UsersTable
      users={listUsers()}
      isSuper={roleAtLeast(session.user.role, 'SUPER_ADMIN')}
      selfId={session.user.id}
    />
  );
}
