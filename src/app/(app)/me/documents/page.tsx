import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listBookmarks, listDocuments } from '@/lib/data/workspace';
import { timeAgo } from '@/lib/format';
import { EmptyState } from '@/components/ui';
import { IconDoc } from '@/components/icons';

export const metadata: Metadata = { title: 'My Documents' };
export const dynamic = 'force-dynamic';

export default function MyDocumentsPage() {
  const session = getSessionUser();
  if (!session) redirect('/login');

  const docs = listDocuments(session.user.id);
  const bookmarks = listBookmarks(session.user.id);

  return (
    <div>
      <div className="page-head row spread row--wrap">
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>My Documents</h1>
          <p>Your saved letters and bookmarks. Private to your account.</p>
        </div>
        <Link href="/write" className="btn btn--primary">+ New letter</Link>
      </div>

      <h2 style={{ fontSize: '1.15rem' }}>Generated letters</h2>
      {docs.length === 0 ? (
        <div className="card"><EmptyState title="No documents yet" body="Letters you save from the Write Center appear here for easy reprinting." action={<Link className="btn btn--outline btn--sm" href="/write">Open Write Center</Link>} /></div>
      ) : (
        <div className="grid grid--2">
          {docs.map((d) => (
            <Link key={d.id} href={`/me/documents/${d.id}`} className="action-tile" style={{ padding: 16 }}>
              <span className="action-tile__icon action-tile__icon--write" style={{ width: 36, height: 36 }}><IconDoc size={18} /></span>
              <h3 style={{ fontSize: '0.98rem' }}>{d.title}</h3>
              <p className="small">Saved {timeAgo(d.created_at)}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="divider-label">Bookmarks</div>
      {bookmarks.length === 0 ? (
        <div className="card"><p className="muted" style={{ margin: 0 }}>Nothing bookmarked yet.</p></div>
      ) : (
        <div className="card" style={{ padding: 6 }}>
          {bookmarks.map((b) => (
            <Link key={b.id} href={b.url} className="menu__item">
              <span style={{ flex: 1 }}>
                <strong style={{ display: 'block' }}>{b.title}</strong>
                <span className="small muted">{b.kind.toLowerCase()} · {timeAgo(b.created_at)}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
