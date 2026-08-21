import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listInstitutions } from '@/lib/data/institutions';
import { ContributeForm } from '@/components/contribute-form';

export const metadata: Metadata = { title: 'Submit an update' };
export const dynamic = 'force-dynamic';

export default function ContributePage() {
  const session = getSessionUser();
  if (!session) redirect('/login?next=/contribute');

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-head">
        <h1 style={{ fontSize: '1.8rem' }}>Submit an update</h1>
        <p>
          Know something other students should know — a deadline, a timetable, an opportunity? Submit it here.
          Every submission goes to the verification queue and carries a trust label before it reaches anyone.
        </p>
      </div>
      <div className="notice notice--info mb-2 small">
        Rule of the house: no rumours. If you don&apos;t have a source, say so — editors verify against official
        channels before publishing.
      </div>
      <ContributeForm institutions={listInstitutions().map((i) => ({ id: i.id, name: i.name, shortName: i.short_name }))} />
    </div>
  );
}
