import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser, roleAtLeast } from '@/lib/auth';
import { listAnnouncementsByStatus, listCutOffsByStatus, listOpenReports, listResourcesByStatus } from '@/lib/data/content';
import { VerificationQueue } from '@/components/admin/verification-queue';

export const metadata: Metadata = { title: 'Admin · Verification queue' };
export const dynamic = 'force-dynamic';

export default function VerificationPage() {
  const session = getSessionUser();
  if (!session || !roleAtLeast(session.user.role, 'MODERATOR')) redirect('/dashboard');

  return (
    <VerificationQueue
      announcements={listAnnouncementsByStatus(['PENDING', 'UNDER_REVIEW'])}
      cutoffs={listCutOffsByStatus(['PENDING', 'UNDER_REVIEW'])}
      resources={listResourcesByStatus('PENDING')}
      reports={listOpenReports()}
      canVerifyContent={roleAtLeast(session.user.role, 'ADMIN')}
    />
  );
}
