import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/auth';
import { listApprovedResources } from '@/lib/data/content';
import { ResourceCenter } from '@/components/resource-center';

export const metadata: Metadata = {
  title: 'Past questions & student resources',
  description: 'Past questions, lecture materials, forms, templates and guides — moderated, organised by institution, course, level and year.'
};
export const dynamic = 'force-dynamic';

export default function ResourcesPage() {
  const session = getSessionUser();
  const resources = listApprovedResources({ institutionId: session?.profile?.institution_id ?? undefined });

  return (
    <div className="container section">
      <h1 style={{ fontSize: '2.2rem' }}>Resource library</h1>
      <p className="muted" style={{ maxWidth: '62ch' }}>
        Past questions, guides, forms and templates. Everything here is moderated; report anything that looks wrong.
      </p>
      <div className="mt-3">
        <ResourceCenter initial={resources} loggedIn={!!session} />
      </div>
    </div>
  );
}
