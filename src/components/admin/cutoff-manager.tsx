'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VERIFICATION_STATUSES } from '@/lib/validation';
import { fmtDate } from '@/lib/format';

export interface AdminCutoff {
  id: string;
  institution_name: string | null;
  programme: string;
  faculty: string | null;
  utme_cutoff: number | null;
  departmental_cutoff: number | null;
  session: string;
  category: string;
  status: string;
  source_name: string;
  last_verified_at: string;
}

export function CutoffManager({ items, institutions }: { items: AdminCutoff[]; institutions: { id: string; name: string; shortName: string | null }[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch('/api/admin/cutoffs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institutionId: form.get('institutionId'),
        programme: form.get('programme'),
        faculty: form.get('faculty') || '',
        utmeCutoff: form.get('utmeCutoff') ? Number(form.get('utmeCutoff')) : null,
        departmentalCutoff: form.get('departmentalCutoff') ? Number(form.get('departmentalCutoff')) : null,
        session: form.get('session'),
        category: form.get('category'),
        sourceName: form.get('sourceName'),
        sourceUrl: form.get('sourceUrl') || '',
        note: form.get('note') || ''
      })
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 201) {
      setMsg('Created (status: PENDING — verify it in the queue below).');
      formEl.reset();
      setShowForm(false);
      router.refresh();
    } else {
      setMsg(data.error ?? 'Something went wrong. Please try again.');
    }
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/cutoffs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.status === 200) router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this cut-off entry?')) return;
    const res = await fetch(`/api/admin/cutoffs/${id}`, { method: 'DELETE' });
    if (res.status === 200) router.refresh();
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row spread">
        <p className="muted" style={{ margin: 0 }}>New entries start as PENDING and stay invisible to students until verified. Archive stale sessions, never overwrite silently.</p>
        <button className="btn btn--primary" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ New entry'}</button>
      </div>

      {msg ? <div className="form-success">{msg}</div> : null}

      {showForm ? (
        <form className="card" onSubmit={submit}>
          <h3 style={{ marginBottom: 12 }}>New cut-off entry</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            <div className="field">
              <label className="req" htmlFor="c-inst">Institution</label>
              <select id="c-inst" name="institutionId" required>
                {institutions.map((i) => <option key={i.id} value={i.id}>{i.shortName ?? i.name}</option>)}
              </select>
            </div>
            <div className="field"><label className="req" htmlFor="c-prog">Programme</label><input id="c-prog" name="programme" required placeholder="e.g. Medicine & Surgery" /></div>
            <div className="field"><label htmlFor="c-fac">Faculty</label><input id="c-fac" name="faculty" placeholder="optional" /></div>
            <div className="field"><label htmlFor="c-utme">UTME cut-off</label><input id="c-utme" name="utmeCutoff" type="number" min={0} max={400} placeholder="e.g. 140" /></div>
            <div className="field"><label htmlFor="c-dept">Departmental cut-off</label><input id="c-dept" name="departmentalCutoff" type="number" min={0} max={100} step="0.1" /></div>
            <div className="field"><label className="req" htmlFor="c-sess">Session</label><input id="c-sess" name="session" required placeholder="e.g. 2025/2026" /></div>
            <div className="field">
              <label htmlFor="c-cat">Category</label>
              <select id="c-cat" name="category" defaultValue="UTME"><option value="UTME">UTME</option><option value="DEPARTMENTAL">Departmental</option><option value="POST_UTME">Post-UTME</option></select>
            </div>
            <div className="field"><label className="req" htmlFor="c-src">Source name</label><input id="c-src" name="sourceName" required placeholder="e.g. UNICAL admissions office" /></div>
            <div className="field"><label htmlFor="c-url">Source URL</label><input id="c-url" name="sourceUrl" type="url" placeholder="https://…" /></div>
          </div>
          <div className="field"><label htmlFor="c-note">Note</label><textarea id="c-note" name="note" style={{ minHeight: 60 }} placeholder="Context for students, e.g. departmental variation…" /></div>
          <button className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Create entry'}</button>
        </form>
      ) : null}

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Programme</th><th>Session</th><th>UTME</th><th>Dept.</th><th>Status</th><th>Verified</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.programme}</strong><div className="small muted">{c.institution_name} · {c.source_name}</div></td>
                <td>{c.session}</td>
                <td>{c.utme_cutoff ?? '—'}</td>
                <td>{c.departmental_cutoff ?? '—'}</td>
                <td>
                  <select aria-label="status" defaultValue={c.status} onChange={(e) => setStatus(c.id, e.target.value)} style={{ minHeight: 34, fontSize: '0.85rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--line-strong)' }}>
                    {VERIFICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="small">{fmtDate(c.last_verified_at)}</td>
                <td><button className="btn btn--danger-outline btn--sm" onClick={() => remove(c.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
