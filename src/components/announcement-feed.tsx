'use client';

import { useMemo, useState } from 'react';
import { fmtDate, timeAgo } from '@/lib/format';

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  urgency: string;
  status: string;
  institution_name: string | null;
  source_name: string;
  source_url: string | null;
  published_at: string;
  updated_at: string;
  last_verified_at: string;
}

const CATEGORIES = ['ALL', 'JAMB', 'ADMISSION', 'REGISTRATION', 'EXAMINATIONS', 'FEES', 'SIWES', 'RESULTS', 'OPPORTUNITY', 'GENERAL'];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    VERIFIED: { label: 'Officially verified', cls: 'badge--verified' },
    REPORTED: { label: 'Source reported', cls: 'badge--reported' },
    OUTDATED: { label: 'Outdated', cls: 'badge--outdated' }
  };
  const v = map[status] ?? { label: 'Needs verification', cls: 'badge--pending' };
  return <span className={`badge ${v.cls}`}>{v.label}</span>;
}

export function AnnouncementFeed({ items }: { items: FeedItem[] }) {
  const [cat, setCat] = useState('ALL');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (cat !== 'ALL' && i.category !== cat) return false;
      const needle = q.trim().toLowerCase();
      if (needle && !`${i.title} ${i.summary} ${i.institution_name ?? ''}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [items, cat, q]);

  return (
    <>
      <div className="row row--wrap mb-2">
        <input
          className="input"
          style={{ maxWidth: 340 }}
          type="search"
          placeholder="Filter updates…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Filter announcements"
        />
        <div className="pill-list">
          {CATEGORIES.map((c) => (
            <button key={c} className={`pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
              {c === 'ALL' ? 'All' : c.charAt(0) + c.slice(1).toLowerCase().replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><p className="muted" style={{ margin: 0 }}>Nothing here yet for this filter.</p></div>
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          {filtered.map((a) => (
            <article key={a.id} id={a.id} className="card">
              <div className="row row--wrap" style={{ gap: 8 }}>
                <span className="tag">{a.category.replace(/_/g, ' ')}</span>
                {a.urgency === 'URGENT' ? <span className="badge badge--urgent">Urgent</span> : null}
                {a.urgency === 'IMPORTANT' ? <span className="badge badge--important">Important</span> : null}
                <StatusBadge status={a.status} />
                <span className="small muted" style={{ marginLeft: 'auto' }}>{timeAgo(a.published_at)}</span>
              </div>
              <h3 className="mt-1" style={{ marginBottom: 6 }}>{a.title}</h3>
              <p className="muted" style={{ marginBottom: expanded === a.id ? 12 : 0 }}>{a.summary}</p>

              {expanded === a.id ? (
                <p style={{ whiteSpace: 'pre-wrap' }}>{a.body}</p>
              ) : null}

              <div className="row spread row--wrap mt-1">
                <button className="btn btn--ghost btn--sm" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                  {expanded === a.id ? 'Show less' : 'Read more'}
                </button>
                <div className="small muted text-right">
                  {a.institution_name ?? 'National'} · Source:{' '}
                  {a.source_url ? (
                    <a href={a.source_url} target="_blank" rel="noopener noreferrer">{a.source_name}</a>
                  ) : (
                    a.source_name
                  )}
                  <br />
                  Published {fmtDate(a.published_at)}
                  {a.updated_at !== a.published_at ? ` · Updated ${fmtDate(a.updated_at)}` : ''} · Last verified {fmtDate(a.last_verified_at)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
