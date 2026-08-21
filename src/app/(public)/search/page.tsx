import type { Metadata } from 'next';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { searchAll } from '@/lib/search';

export const metadata: Metadata = { title: 'Search', robots: { index: false } };
export const dynamic = 'force-dynamic';

function Group({ title, items, renderMeta }: { title: string; items: { title: string; description: string; url: string }[]; renderMeta?: (item: never) => React.ReactNode }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-2">
      <div className="divider-label">{title}</div>
      <div className="card" style={{ padding: 6 }}>
        {items.map((i) => (
          <Link key={i.url + i.title} href={i.url} className="menu__item" style={{ alignItems: 'flex-start' }}>
            <span style={{ flex: 1 }}>
              <strong style={{ display: 'block' }}>{i.title}</strong>
              <span className="small muted">{i.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const session = getSessionUser();

  return (
    <div className="container section">
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem' }}>Search</h1>
        <form action="/search" method="GET" className="row mb-3" role="search">
          <input className="input grow" type="search" name="q" defaultValue={q} placeholder="Try: unical cut off · suspension letter · cgpa calculator" aria-label="Search" />
          <button className="btn btn--primary">Search</button>
        </form>

        {!q ? (
          <p className="muted">Search tools, letters, verified updates, universities, cut-offs and resources from one box.</p>
        ) : (
          <SearchResults query={q} institutionId={session?.profile?.institution_id ?? null} />
        )}
      </div>
    </div>
  );
}

function SearchResults({ query, institutionId }: { query: string; institutionId: string | null }) {
  const r = searchAll(query, { institutionId });
  return (
    <>
      <p className="small muted">{r.total} result{r.total === 1 ? '' : 's'} for &ldquo;{query}&rdquo;</p>
      <Group title="Tools" items={r.tools} />
      <Group title="Letter templates" items={r.letters} />
      <Group title="Information & answers" items={r.info} />
      <Group title="Verified updates" items={r.announcements} />
      <Group title="Universities" items={r.universities} />
      <Group title="Cut-off marks" items={r.cutoffs} />
      <Group title="Resources" items={r.resources} />
      {r.total === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No matches</h3>
          <p className="muted" style={{ margin: 0 }}>Try broader words — e.g. &ldquo;cut off&rdquo;, &ldquo;appeal&rdquo;, &ldquo;jamb&rdquo; — or browse the <Link href="/letters">letter templates</Link>.</p>
        </div>
      ) : null}
    </>
  );
}
