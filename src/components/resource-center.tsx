'use client';

import { useMemo, useState } from 'react';
import { IconDownload } from '@/components/icons';
import { LEVELS, RESOURCE_TYPES } from '@/lib/validation';
import { fmtDate } from '@/lib/format';

export interface ResourceLite {
  id: string;
  title: string;
  description: string | null;
  type: string;
  institution_name: string | null;
  course: string | null;
  level: string | null;
  year: number | null;
  file_name: string | null;
  file_size: number | null;
  external_url: string | null;
  downloads: number;
  created_at: string;
}

function humanSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ResourceCenter({ initial, loggedIn }: { initial: ResourceLite[]; loggedIn: boolean }) {
  const [items] = useState(initial);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgKind, setMsgKind] = useState<'ok' | 'err'>('ok');
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState(initial);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return list.filter((r) => {
      if (type && r.type !== type) return false;
      if (needle && !`${r.title} ${r.course ?? ''} ${r.description ?? ''}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [list, q, type]);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    const formEl = e.currentTarget;
    const res = await fetch('/api/resources', { method: 'POST', body: new FormData(formEl) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 201) {
      setMsgKind('ok');
      setMsg(data.message ?? 'Uploaded.');
      formEl.reset();
      setShowUpload(false);
      if (data.status === 'APPROVED') window.location.reload();
    } else {
      setMsgKind('err');
      setMsg(data.error ?? 'Upload failed. Please try again.');
    }
  }

  async function report(id: string) {
    const reason = window.prompt('Why are you reporting this resource? (wrong content, broken file, etc.)');
    if (!reason || reason.trim().length < 4) return;
    const res = await fetch(`/api/resources/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason.trim() })
    });
    const data = await res.json().catch(() => ({}));
    setMsgKind(res.status === 201 ? 'ok' : 'err');
    setMsg(data.message ?? (res.status === 201 ? 'Reported.' : 'Could not report. Please try again.'));
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row row--wrap spread">
        <div className="row row--wrap grow">
          <input className="input" style={{ maxWidth: 320 }} type="search" placeholder="Search title, course…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search resources" />
          <select className="input" style={{ maxWidth: 220 }} value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="">All types</option>
            {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        {loggedIn ? (
          <button className="btn btn--primary" onClick={() => setShowUpload((s) => !s)}>{showUpload ? 'Close' : 'Share a resource'}</button>
        ) : (
          <a className="btn btn--primary" href="/login?next=/resources">Log in to share</a>
        )}
      </div>

      {msg ? <div className={msgKind === 'ok' ? 'form-success' : 'form-error'} role="status">{msg}</div> : null}

      {showUpload ? (
        <form className="card" onSubmit={upload} encType="multipart/form-data">
          <h3 style={{ marginBottom: 4 }}>Share a resource</h3>
          <p className="small muted" style={{ marginTop: 0 }}>
            Accepted: PDF, DOC, DOCX, JPG or PNG up to 5 MB — or paste an official link. Uploads are moderated before they appear publicly.
          </p>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="field"><label className="req" htmlFor="r-title">Title</label><input id="r-title" name="title" required minLength={4} maxLength={200} placeholder="e.g. CSC 301 past questions 2023" /></div>
            <div className="field">
              <label className="req" htmlFor="r-type">Type</label>
              <select id="r-type" name="type" defaultValue="PAST_QUESTION">{RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select>
            </div>
            <div className="field"><label htmlFor="r-course">Course <span className="hint">(optional)</span></label><input id="r-course" name="course" maxLength={60} placeholder="e.g. CSC 301" /></div>
            <div className="field">
              <label htmlFor="r-level">Level <span className="hint">(optional)</span></label>
              <select id="r-level" name="level"><option value="">—</option>{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select>
            </div>
            <div className="field"><label htmlFor="r-year">Year <span className="hint">(optional)</span></label><input id="r-year" name="year" type="number" min={1990} max={2100} placeholder="e.g. 2024" /></div>
          </div>
          <div className="field"><label htmlFor="r-desc">Description <span className="hint">(optional)</span></label><textarea id="r-desc" name="description" style={{ minHeight: 60 }} maxLength={1000} /></div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className="field"><label htmlFor="r-file">File</label><input id="r-file" name="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" /></div>
            <div className="field"><label htmlFor="r-url">…or official link</label><input id="r-url" name="externalUrl" type="url" placeholder="https://…" /></div>
          </div>
          <button className="btn btn--primary" disabled={busy}>{busy ? 'Uploading…' : 'Submit for moderation'}</button>
        </form>
      ) : null}

      {filtered.length === 0 ? (
        <div className="card"><p className="muted" style={{ margin: 0 }}>No resources match. As the community shares past questions and materials, they appear here.</p></div>
      ) : (
        <div className="grid grid--2">
          {filtered.map((r) => (
            <div key={r.id} className="card update-card" id={r.id}>
              <div className="row row--wrap" style={{ gap: 8 }}>
                <span className="tag">{r.type.replace(/_/g, ' ')}</span>
                {r.course ? <span className="tag">{r.course}</span> : null}
                {r.level ? <span className="tag">{r.level}L</span> : null}
                {r.year ? <span className="tag">{r.year}</span> : null}
              </div>
              <h4 style={{ margin: 0 }}>{r.title}</h4>
              {r.description ? <p className="small muted" style={{ margin: 0 }}>{r.description}</p> : null}
              <div className="row spread small muted row--wrap">
                <span>
                  {r.institution_name ?? 'General'}{r.file_name ? ` · ${r.file_name} (${humanSize(r.file_size)})` : ''} · {fmtDate(r.created_at)}
                </span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {r.external_url ? (
                  <a className="btn btn--outline btn--sm" href={r.external_url} target="_blank" rel="noopener noreferrer">↗ Open link</a>
                ) : loggedIn ? (
                  <a className="btn btn--primary btn--sm" href={`/api/resources/${r.id}/download`}><IconDownload size={15} /> Download {r.downloads > 0 ? `(${r.downloads})` : ''}</a>
                ) : (
                  <a className="btn btn--outline btn--sm" href="/login?next=/resources">Log in to download</a>
                )}
                {loggedIn ? <button className="btn btn--ghost btn--sm" onClick={() => report(r.id)}>Report</button> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
