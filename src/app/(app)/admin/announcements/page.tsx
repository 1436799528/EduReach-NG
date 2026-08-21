import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser, roleAtLeast } from '@/lib/auth';
import { listAllAnnouncements } from '@/lib/data/content';
import { listInstitutions } from '@/lib/data/institutions';
import { AnnouncementManager } from '@/components/admin/announcement-manager';

export const metadata: Metadata = { title: 'Admin · Announcements' };
export const dynamic = 'force-dynamic';

export default function AdminAnnouncementsPage() {
  const session = getSessionUser();
  if (!session || !roleAtLeast(session.user.role, 'ADMIN')) redirect('/dashboard');

  return (
    <AnnouncementManager
      items={listAllAnnouncements()}
      institutions={listInstitutions().map((i) => ({ id: i.id, name: i.name, shortName: i.short_name }))}
    />
  );
}
