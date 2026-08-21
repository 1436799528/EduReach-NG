import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listActivity } from '@/lib/data/workspace';
import { timeAgo } from '@/lib/format';
import { EmptyState } from '@/components/ui';

export const metadata: Metadata = { title: 'My Activity' };
export const dynamic = 'force-dynamic';

const KIND_ICONS: Record<string, string> = {
  ACCOUNT_CREATED: '🎉', LETTER_SAVED: '✍️', DEADLINE_CREATED: '⏰', RESOURCE_UPLOADED: '📤', PROFILE_UPDATED: '🪪'
};

export default function ActivityPage() {
  const session = getSessionUser();
  if (!session) redirect('/login');

  const items = listActivity(session.user.id, 80);

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-head">
        <h1 style={{ fontSize: '1.8rem' }}>My Activity</h1>
        <p>Your recent letters, calculations, uploads and changes — so you can pick up where you stopped.</p>
      </div>
      {items.length === 0 ? (
        <div className="card">
          <EmptyState title="No activity yet" body="Generate a letter or add a deadline and it will show up here." action={<Link className="btn btn--outline btn--sm" href="/write">Write a letter</Link>} />
        </div>
      ) : (
        <div className="card" style={{ padding: 8 }}>
          {items.map((a) => (
            <div key={a.id} className="row" style={{ padding: '10px 10px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: 18 }} aria-hidden="true">{KIND_ICONS[a.kind] ?? '•'}</span>
              <span className="grow" style={{ fontSize: '0.95rem' }}>{a.summary}</span>
              <span className="small muted">{timeAgo(a.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
