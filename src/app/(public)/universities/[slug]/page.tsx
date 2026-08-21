import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInstitutionFull } from '@/lib/data/institutions';
import { listCutOffsByInstitution, listVerifiedAnnouncements } from '@/lib/data/content';
import { STUDENT_LIFE_GUIDES } from '@/lib/content/guides';
import { fmtDate } from '@/lib/format';
import { CategoryTag, UrgencyBadge, VerificationBadge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const inst = getInstitutionFull(params.slug);
  if (!inst) return { title: 'University' };
  return {
    title: `${inst.name}${inst.short_name ? ` (${inst.short_name})` : ''} — admission, cut-offs, updates`,
    description: inst.about ?? `Verified information about ${inst.name}.`
  };
}

export default function UniversityProfilePage({ params }: { params: { slug: string } }) {
  const inst = getInstitutionFull(params.slug);
  if (!inst) notFound();

  const cutoffs = listCutOffsByInstitution(inst.id);
  const updates = listVerifiedAnnouncements({ institutionId: inst.id, limit: 6 });

  return (
    <div className="container section">
      <p className="small muted" style={{ marginBottom: 4 }}><Link href="/universities">← All universities</Link></p>
      <div className="row row--wrap spread">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>{inst.name}{inst.short_name ? ` (${inst.short_name})` : ''}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {inst.type === 'UNIVERSITY' ? 'University' : inst.type.replace(/_/g, ' ')} · {inst.state}{inst.city ? `, ${inst.city}` : ''} · Nigeria
          </p>
        </div>
        <div className="pill-list">
          {inst.website ? <a className="pill" href={inst.website} target="_blank" rel="noopener noreferrer">↗ Official website</a> : null}
          {inst.admission_portal && inst.admission_portal !== inst.website ? (
            <a className="pill" href={inst.admission_portal} target="_blank" rel="noopener noreferrer">↗ Admission portal</a>
          ) : null}
        </div>
      </div>

      {inst.about ? <p className="mt-2" style={{ maxWidth: '72ch' }}>{inst.about}</p> : null}

      <div className="grid mt-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', alignItems: 'start' }}>
        {/* Cut-offs */}
        <section className="card">
          <div className="card__title"><h2 style={{ fontSize: '1.15rem', margin: 0 }}>Cut-off marks</h2></div>
          {cutoffs.length === 0 ? (
            <p className="muted small">No verified cut-off data yet. We only publish figures with sources.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Programme</th><th>Session</th><th>UTME</th><th>Status</th><th>Verified</th></tr></thead>
                <tbody>
                  {cutoffs.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.programme}</strong>
                        {c.note ? <div className="small muted">{c.note}</div> : null}
                      </td>
                      <td>{c.session}</td>
                      <td><strong>{c.utme_cutoff ?? 'TBD'}</strong></td>
                      <td><VerificationBadge status={c.status} /></td>
                      <td className="small muted">{fmtDate(c.last_verified_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="small muted mt-1" style={{ marginBottom: 0 }}>
            Cut-offs change every session. Always confirm on the official admission portal.
          </p>
        </section>

        {/* Latest updates */}
        <section className="card">
          <div className="card__title">
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Latest updates</h2>
            <Link href="/check" className="btn btn--ghost btn--sm">All updates</Link>
          </div>
          {updates.length === 0 ? (
            <p className="muted small">No published updates yet.</p>
          ) : (
            updates.map((a) => (
              <article key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div className="row" style={{ gap: 6 }}>
                  <CategoryTag label={a.category} /><UrgencyBadge urgency={a.urgency} /><VerificationBadge status={a.status} />
                </div>
                <h4 className="mt-1" style={{ margin: '6px 0 2px' }}>{a.title}</h4>
                <p className="small muted" style={{ margin: 0 }}>{a.summary}</p>
                <div className="small muted mt-1">Source: {a.source_name} · Last verified {fmtDate(a.last_verified_at)}</div>
              </article>
            ))
          )}
        </section>
      </div>

      {/* Faculties & departments */}
      <section className="mt-3">
        <h2 style={{ fontSize: '1.3rem' }}>Faculties &amp; departments</h2>
        <div className="grid grid--2">
          {inst.faculties.map((f) => (
            <div key={f.id} className="card">
              <h3 style={{ fontSize: '1rem' }}>{f.name}</h3>
              <div className="pill-list">
                {f.departments.map((d) => <span key={d.id} className="pill" style={{ cursor: 'default' }}>{d.name}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student life */}
      <section className="mt-3">
        <h2 style={{ fontSize: '1.3rem' }}>Student life essentials</h2>
        <div className="grid grid--3">
          {STUDENT_LIFE_GUIDES.map((g) => (
            <div key={g.title} className="card">
              <h3 style={{ fontSize: '1rem' }}>{g.title}</h3>
              {g.body.map((p, i) => <p key={i} className="small muted" style={{ marginBottom: '0.5em' }}>{p}</p>)}
            </div>
          ))}
        </div>
        <div className="card mt-3" style={{ borderLeft: '4px solid var(--green)' }}>
          <div className="row row--wrap spread">
            <p className="muted" style={{ margin: 0 }}>
              Study <strong>{inst.short_name ?? inst.name}</strong>? Set it as your school and your dashboard personalises itself.
            </p>
            <Link href="/register" className="btn btn--primary btn--sm">Create free account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
