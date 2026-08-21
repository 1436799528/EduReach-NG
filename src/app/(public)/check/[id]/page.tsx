import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findAnnouncement, listVerifiedAnnouncements } from '@/lib/data/content';
import { fmtDate } from '@/lib/format';
import { CategoryTag, UrgencyBadge, VerificationBadge } from '@/components/ui';
import { BookmarkButton } from '@/components/bookmark-button';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const a = findAnnouncement(params.id);
  if (!a || !['VERIFIED', 'OUTDATED'].includes(a.status)) return { title: 'Update' };
  return { title: a.title, description: a.summary };
}

export default function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  const a = findAnnouncement(params.id);
  if (!a || !['VERIFIED', 'OUTDATED'].includes(a.status)) notFound();

  const session = getSessionUser();
  const related = listVerifiedAnnouncements({ limit: 4 }).filter((x) => x.id !== a.id).slice(0, 3);

  return (
    <div className="container section">
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <p className="small muted" style={{ marginBottom: 6 }}><Link href="/check">← All updates</Link></p>

        <article className="card card--pad-lg">
          <div className="row row--wrap" style={{ gap: 8 }}>
            <CategoryTag label={a.category} />
            <UrgencyBadge urgency={a.urgency} />
            <VerificationBadge status={a.status} />
            <span className="grow" />
            {session ? <BookmarkButton kind="ANNOUNCEMENT" title={a.title} url={`/check/${a.id}`} /> : null}
          </div>

          <h1 style={{ fontSize: '1.7rem', margin: '12px 0 10px' }}>{a.title}</h1>
          <p className="muted" style={{ fontSize: '1.05rem' }}>{a.summary}</p>

          <div className="notice notice--info small" style={{ whiteSpace: 'normal' }}>
            <strong>{a.institution_name ?? 'National'}</strong>
            {' · '}Source:{' '}
            {a.source_url ? <a href={a.source_url} target="_blank" rel="noopener noreferrer">{a.source_name}</a> : a.source_name}
            <br />
            Published {fmtDate(a.published_at)}
            {a.updated_at !== a.published_at ? ` · Updated ${fmtDate(a.updated_at)}` : ''}
            {a.effective_date ? ` · Effective ${fmtDate(a.effective_date)}` : ''}
            {' · '}Last verified {fmtDate(a.last_verified_at)}
          </div>

          <div className="mt-3" style={{ whiteSpace: 'pre-wrap', fontSize: '1.02rem', lineHeight: 1.7 }}>
            {a.body}
          </div>
        </article>

        {a.source_url ? (
          <p className="small muted mt-2">
            For anything time-sensitive (dates, fees, lists), confirm on{' '}
            <a href={a.source_url} target="_blank" rel="noopener noreferrer">the official source</a> before acting.
          </p>
        ) : null}

        {related.length > 0 ? (
          <>
            <div className="divider-label">More verified updates</div>
            <div className="stack" style={{ gap: 10 }}>
              {related.map((r) => (
                <Link key={r.id} href={`/check/${r.id}`} className="attention-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span className="grow">
                    <strong>{r.title}</strong>
                    <div className="small muted">{r.institution_name ?? 'National'} · {r.category.replace(/_/g, ' ')} · {fmtDate(r.published_at)}</div>
                  </span>
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
