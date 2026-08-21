import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getInstitutionFull } from '@/lib/data/institutions';
import { listCutOffsByInstitution, listVerifiedAnnouncements } from '@/lib/data/content';
import { fmtDate } from '@/lib/format';
import { CategoryTag, UrgencyBadge, VerificationBadge } from '@/components/ui';

export const metadata: Metadata = { title: 'My School' };
export const dynamic = 'force-dynamic';

export default function MySchoolPage() {
  const session = getSessionUser();
  if (!session) redirect('/login');

  if (!session.institutionSlug) {
    return (
      <div style={{ maxWidth: 560 }}>
        <div className="page-head"><h1 style={{ fontSize: '1.8rem' }}>My School</h1></div>
        <div className="card card--pad-lg" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.2rem' }}>You haven&apos;t set your school yet</h2>
          <p className="muted">Pick your institution and this page becomes your home for its updates, cut-offs, portals and procedures.</p>
          <Link href="/onboarding" className="btn btn--primary">Set my school</Link>
        </div>
      </div>
    );
  }

  const inst = getInstitutionFull(session.institutionSlug);
  if (!inst) redirect('/onboarding');
  const cutoffs = listCutOffsByInstitution(inst.id);
  const updates = listVerifiedAnnouncements({ institutionId: inst.id, limit: 8 });
  const myFaculty = inst.faculties.find((f) => f.id === session.profile?.faculty_id);
  const myDept = myFaculty?.departments.find((d) => d.id === session.profile?.department_id);

  return (
    <div>
      <div className="page-head">
        <h1 style={{ fontSize: '1.8rem' }}>{inst.short_name ?? inst.name}</h1>
        <p>
          {myDept ? `${myDept.name} · ` : ''}{myFaculty ? `${myFaculty.name} · ` : ''}
          {session.profile?.level ? `${session.profile.level} level · ` : ''}
          <Link href="/me/settings">Edit</Link>
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', alignItems: 'start' }}>
        <section className="card">
          <div className="card__title"><h3>Latest at {inst.short_name ?? 'your school'}</h3><Link href="/check" className="btn btn--ghost btn--sm">All</Link></div>
          {updates.length === 0 ? <p className="small muted">No published updates yet.</p> : updates.map((a) => (
            <article key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div className="row" style={{ gap: 6 }}><CategoryTag label={a.category} /><UrgencyBadge urgency={a.urgency} /><VerificationBadge status={a.status} /></div>
              <strong style={{ display: 'block', margin: '6px 0 2px' }}>{a.title}</strong>
              <span className="small muted">{a.summary}</span>
              <div className="small muted mt-1">Source: {a.source_name} · Last verified {fmtDate(a.last_verified_at)}</div>
            </article>
          ))}
        </section>

        <div className="stack">
          <section className="card">
            <div className="card__title"><h3>Portals &amp; links</h3></div>
            <div className="pill-list">
              {inst.website ? <a className="pill" href={inst.website} target="_blank" rel="noopener noreferrer">↗ Official website</a> : null}
              {inst.admission_portal ? <a className="pill" href={inst.admission_portal} target="_blank" rel="noopener noreferrer">↗ Admissions</a> : null}
              <Link className="pill" href="/deadlines">Track my deadlines</Link>
              <Link className="pill" href="/resources">Past questions</Link>
            </div>
          </section>

          <section className="card">
            <div className="card__title"><h3>Cut-off marks</h3></div>
            {cutoffs.length === 0 ? (
              <p className="small muted" style={{ margin: 0 }}>No verified cut-off data yet.</p>
            ) : (
              cutoffs.map((c) => (
                <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <div className="row spread">
                    <strong>{c.programme}</strong>
                    <span className="countdown">{c.session}</span>
                  </div>
                  <div className="row spread mt-1">
                    <span className="small">UTME cut-off: <strong>{c.utme_cutoff ?? 'To be announced'}</strong></span>
                    <VerificationBadge status={c.status} />
                  </div>
                  {c.note ? <p className="small muted mt-1" style={{ margin: 0 }}>{c.note}</p> : null}
                </div>
              ))
            )}
          </section>
        </div>
      </div>

      <div className="divider-label">Your faculty &amp; department</div>
      <div className="grid grid--2">
        <div className="card">
          <h3 style={{ fontSize: '1rem' }}>{myFaculty ? myFaculty.name : 'Faculty not set'}</h3>
          {myFaculty ? (
            <div className="pill-list">
              {myFaculty.departments.map((d) => (
                <span key={d.id} className={`pill ${d.id === session.profile?.department_id ? 'active' : ''}`}>{d.name}</span>
              ))}
            </div>
          ) : (
            <p className="small muted" style={{ margin: 0 }}><Link href="/me/settings">Complete your profile</Link> to see your faculty here.</p>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem' }}>All faculties at {inst.short_name ?? 'this school'}</h3>
          <ul className="small muted" style={{ margin: 0, paddingLeft: 18, columns: 2 }}>
            {inst.faculties.map((f) => <li key={f.id}>{f.name}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
