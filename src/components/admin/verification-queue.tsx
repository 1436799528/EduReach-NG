'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fmtDate } from '@/lib/format';

interface QueuedAnnouncement {
  id: string; title: string; summary: string; category: string; source_name: string; source_url: string | null; status: string; published_at: string; institution_name: string | null;
}
interface QueuedCutoff {
  id: string; programme: string; session: string; utme_cutoff: number | null; status: string; source_name: string; institution_name: string | null; last_verified_at: string;
}
interface QueuedResource {
  id: string; title: string; type: string; status: string; uploader_name: string | null; created_at: string; file_name: string | null; external_url: string | null;
}
interface OpenReport {
  id: string; resource_id: string; resource_title: string; reason: string; created_at: string;
}

export function VerificationQueue({
  announcements, cutoffs, resources, reports, canVerifyContent
}: {
  announcements: QueuedAnnouncement[];
  cutoffs: QueuedCutoff[];
  resources: QueuedResource[];
  reports: OpenReport[];
  canVerifyContent: boolean;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState('');

  async function act(url: string, payload: unknown, successMsg: string) {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.status === 200) {
      setMsg(successMsg);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error ?? 'Action failed.');
    }
    setTimeout(() => setMsg(''), 2500);
  }

  const empty = announcements.length === 0 && cutoffs.length === 0 && resources.length === 0 && reports.length === 0;

  return (
    <div className="stack" style={{ gap: 22 }}>
      {msg ? <div className="form-success">{msg}</div> : null}
      {empty ? (
        <div className="card"><p className="muted" style={{ margin: 0 }}>Queue is clear. Nothing awaiting verification or moderation. ✅</p></div>
      ) : null}

      {announcements.length > 0 ? (
        <section>
          <h3>Announcements awaiting verification ({announcements.length})</h3>
          {announcements.map((a) => (
            <div key={a.id} className="card mb-1">
              <div className="row row--wrap" style={{ gap: 8 }}>
                <span className="tag">{a.category}</span>
                <span className="tag">{a.status}</span>
                <span className="small muted">{a.institution_name ?? 'National'} · {fmtDate(a.published_at)}</span>
              </div>
              <strong style={{ display: 'block', margin: '6px 0 2px' }}>{a.title}</strong>
              <p className="small muted" style={{ margin: 0 }}>{a.summary}</p>
              <p className="small muted mt-1" style={{ margin: 0 }}>
                Source: {a.source_url ? <a href={a.source_url} target="_blank" rel="noopener noreferrer">{a.source_name}</a> : a.source_name}
              </p>
              {canVerifyContent ? (
                <div className="row mt-1" style={{ gap: 8 }}>
                  <button className="btn btn--primary btn--sm" onClick={() => act(`/api/admin/announcements/${a.id}`, { status: 'VERIFIED' }, 'Verified & published (students notified if applicable).')}>Verify &amp; publish</button>
                  <button className="btn btn--outline btn--sm" onClick={() => act(`/api/admin/announcements/${a.id}`, { status: 'UNDER_REVIEW' }, 'Marked under review.')}>Under review</button>
                  <button className="btn btn--danger-outline btn--sm" onClick={() => act(`/api/admin/announcements/${a.id}`, { status: 'REJECTED' }, 'Rejected.')}>Reject</button>
                </div>
              ) : (
                <p className="small muted mt-1" style={{ margin: 0 }}>Verification requires an administrator.</p>
              )}
            </div>
          ))}
        </section>
      ) : null}

      {cutoffs.length > 0 ? (
        <section>
          <h3>Cut-off entries awaiting verification ({cutoffs.length})</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Programme</th><th>Session</th><th>Value</th><th>Source</th><th>Actions</th></tr></thead>
              <tbody>
                {cutoffs.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.programme}</strong><div className="small muted">{c.institution_name}</div></td>
                    <td>{c.session}</td>
                    <td>{c.utme_cutoff ?? '—'}</td>
                    <td className="small">{c.source_name}</td>
                    <td>
                      {canVerifyContent ? (
                        <div className="row" style={{ gap: 6 }}>
                          <button className="btn btn--primary btn--sm" onClick={() => act(`/api/admin/cutoffs/${c.id}`, { status: 'VERIFIED' }, 'Cut-off verified.')}>Verify</button>
                          <button className="btn btn--danger-outline btn--sm" onClick={() => act(`/api/admin/cutoffs/${c.id}`, { status: 'REJECTED' }, 'Rejected.')}>Reject</button>
                        </div>
                      ) : <span className="small muted">Admin only</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {resources.length > 0 ? (
        <section>
          <h3>Resources awaiting moderation ({resources.length})</h3>
          {resources.map((r) => (
            <div key={r.id} className="card mb-1 row row--wrap spread">
              <span className="grow">
                <strong>{r.title}</strong>
                <div className="small muted">{r.type.replace(/_/g, ' ')} · by {r.uploader_name ?? 'unknown'} · {fmtDate(r.created_at)}{r.file_name ? ` · ${r.file_name}` : ''}{r.external_url ? ` · link` : ''}</div>
              </span>
              <span className="row" style={{ gap: 6 }}>
                <button className="btn btn--primary btn--sm" onClick={() => act(`/api/admin/resources/${r.id}`, { status: 'APPROVED' }, 'Resource approved.')}>Approve</button>
                <button className="btn btn--danger-outline btn--sm" onClick={() => act(`/api/admin/resources/${r.id}`, { status: 'REJECTED' }, 'Resource rejected.')}>Reject</button>
              </span>
            </div>
          ))}
        </section>
      ) : null}

      {reports.length > 0 ? (
        <section>
          <h3>Open reports ({reports.length})</h3>
          {reports.map((r) => (
            <div key={r.id} className="card mb-1">
              <strong>{r.resource_title}</strong>
              <p className="small muted" style={{ margin: '4px 0' }}>&ldquo;{r.reason}&rdquo; · {fmtDate(r.created_at)}</p>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn--outline btn--sm" onClick={() => act(`/api/admin/resources/${r.resource_id}`, { resolveReportId: r.id, reportOutcome: 'RESOLVED' }, 'Report resolved.')}>Resolve</button>
                <button className="btn btn--ghost btn--sm" onClick={() => act(`/api/admin/resources/${r.resource_id}`, { resolveReportId: r.id, reportOutcome: 'DISMISSED' }, 'Report dismissed.')}>Dismiss</button>
                <button className="btn btn--danger-outline btn--sm" onClick={() => act(`/api/admin/resources/${r.resource_id}`, { status: 'REJECTED', resolveReportId: r.id, reportOutcome: 'RESOLVED' }, 'Resource removed & report resolved.')}>Remove resource</button>
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
