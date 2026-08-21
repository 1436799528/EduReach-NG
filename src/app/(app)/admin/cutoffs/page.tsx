import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser, roleAtLeast } from '@/lib/auth';
import { all } from '@/lib/db';
import { listInstitutions } from '@/lib/data/institutions';
import { CutoffManager } from '@/components/admin/cutoff-manager';

export const metadata: Metadata = { title: 'Admin · Cut-off marks' };
export const dynamic = 'force-dynamic';

export default function AdminCutoffsPage() {
  const session = getSessionUser();
  if (!session || !roleAtLeast(session.user.role, 'ADMIN')) redirect('/dashboard');

  const items = all(
    `SELECT c.id, i.name AS institution_name, c.programme, c.faculty, c.utme_cutoff, c.departmental_cutoff,
            c.session, c.category, c.status, c.source_name, c.last_verified_at
     FROM cutoff_marks c JOIN institutions i ON i.id = c.institution_id
     ORDER BY c.session DESC, c.programme`
  );

  return (
    <CutoffManager
      items={items as never}
      institutions={listInstitutions().map((i) => ({ id: i.id, name: i.name, shortName: i.short_name }))}
    />
  );
}
