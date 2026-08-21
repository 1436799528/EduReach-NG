'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ANNOUNCEMENT_CATEGORIES, URGENCIES, VERIFICATION_STATUSES } from '@/lib/validation';
import { fmtDate } from '@/lib/format';

export interface AdminAnnouncement {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  urgency: string;
  status: string;
  institution_id: string | null;
  institution_name: string | null;
  source_name: string;
  source_url: string | null;
  effective_date: string | null;
  published_at: string;
  last_verified_at: string;
}

export function AnnouncementManager({ items, institutions }: { items: AdminAnnouncement[]; institutions: { id: string; name: string; shortName: string | null }[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminAnnouncement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  function startEdit(a: AdminAnnouncement) {
    setEditing(a);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      title: form.get('title'),
      summary: form.get('summary'),
      body: form.get('body'),
      category: form.get('category'),
      urgency: form.get('urgency'),
      institutionId: form.get('institutionId') || '',
      sourceName: form.get('sourceName'),
      sourceUrl: form.get('sourceUrl') || '',
      effectiveDate: form.get('effectiveDate') || '',
      ...(editing ? {} : { status: form.get('status') })
    };
    const res = await fetch(editing ? `/api/admin/announcements/${editing.id}` : '/api/admin/announcements', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 201 || res.status === 200) {
      setMsg(editing ? 'Updated.' : 'Created.');
      setEditing(null);
      setShowForm(false);
      router.refresh();
    } else {
      setMsg(data.error ?? 'Something went wrong. Please try again.');
    }
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.status === 200) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error ?? 'Action failed.');
    }
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    if (res.status === 200) router.refresh();
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row spread">
        <p className="muted" style={{ margin: 0 }}>{items.length} total. Publishing as VERIFIED notifies affected students.</p>
        <button className="btn btn--primary" onClick={() => { setEditing(null); setShowForm((s) => !s); }}>{showForm ? 'Close form' : '+ New announcement'}</button>
      </div>

      {msg ? <div className="form-success" role="status">{msg}</div> : null}

      {showForm ? (
        <form className="card" onSubmit={submit} key={editing?.id ?? 'new'}>
          <h3 style={{ marginBottom: 12 }}>{editing ? `Editing: ${editing.title}` : 'New announcement'}</h3>
          <div className="field"><label className="req" htmlFor="a-title">Title</label><input id="a-title" name="title" required minLength={4} maxLength={300} defaultValue={editing?.title ?? ''} /></div>
          <div className="field"><label className="req" htmlFor="a-summary">Summary</label><textarea id="a-summary" name="summary" required minLength={4} maxLength={500} style={{ minHeight: 60 }} defaultValue={editing?.summary ?? ''} /></div>
          <div className="field"><label className="req" htmlFor="a-body">Full content</label><textarea id="a-body" name="body" required minLength={10} style={{ minHeight: 160 }} defaultValue={editing?.body ?? ''} /></div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            <div className="field">
              <label className="req" htmlFor="a-cat">Category</label>
              <select id="a-cat" name="category" defaultValue={editing?.category ?? 'GENERAL'}>{ANNOUNCEMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div className="field">
              <label htmlFor="a-urg">Urgency</label>
              <select id="a-urg" name="urgency" defaultValue={editing?.urgency ?? 'GENERAL'}>{URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}</select>
            </div>
            <div className="field">
              <label htmlFor="a-inst">Institution</label>
              <select id="a-inst" name="institutionId" defaultValue={editing?.institution_id ?? ''}>
                <option value="">National / all</option>
                {institutions.map((i) => <option key={i.id} value={i.id}>{i.shortName ?? i.name}</option>)}
              </select>
            </div>
            <div className="field"><label htmlFor="a-eff">Effective date <span className="hint">(optional)</span></label><input id="a-eff" name="effectiveDate" type="date" /></div>
            <div className="field"><label className="req" htmlFor="a-src">Source name</label><input id="a-src" name="sourceName" required defaultValue={editing?.source_name ?? ''} placeholder="e.g. UNICAL Registrar's notice" /></div>
            <div className="field"><label htmlFor="a-url">Source URL</label><input id="a-url" name="sourceUrl" type="url" defaultValue={editing?.source_url ?? ''} placeholder="https://…" /></div>
            {!editing ? (
              <div className="field">
                <label htmlFor="a-status">Initial status</label>
                <select id="a-status" name="status" defaultValue="PENDING">{VERIFICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              </div>
            ) : null}
          </div>
          <div className="row">
            <button className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create'}</button>
            {editing ? <button type="button" className="btn btn--ghost" onClick={() => { setEditing(null); setShowForm(false); }}>Cancel</button> : null}
          </div>
        </form>
      ) : null}

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Published</th><th>Verified</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{a.title}</strong>
                  <div className="small muted">{a.institution_name ?? 'National'} · Source: {a.source_name}</div>
                </td>
                <td>{a.category}</td>
                <td>
                  <select
                    aria-label={`Status for ${a.title}`}
                    defaultValue={a.status}
                    onChange={(e) => setStatus(a.id, e.target.value)}
                    style={{ minHeight: 34, fontSize: '0.85rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--line-strong)' }}
                  >
                    {VERIFICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="small">{fmtDate(a.published_at)}</td>
                <td className="small">{fmtDate(a.last_verified_at)}</td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn btn--outline btn--sm" onClick={() => startEdit(a)}>Edit</button>
                    <button className="btn btn--danger-outline btn--sm" onClick={() => remove(a.id, a.title)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
