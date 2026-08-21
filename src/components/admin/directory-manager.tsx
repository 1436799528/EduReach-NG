'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Dept { id: string; name: string }
interface Fac { id: string; name: string; departments: Dept[] }
interface Inst {
  id: string; name: string; short_name: string | null; type: string; state: string; city: string | null; slug: string;
  faculties: Fac[];
}

export function DirectoryManager({ initial }: { initial: Inst[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [openForm, setOpenForm] = useState<'institution' | 'faculty' | 'department' | null>(null);
  const [facultyInstId, setFacultyInstId] = useState(initial[0]?.id ?? '');
  const [deptFacId, setDeptFacId] = useState('');

  const facultyInst = useMemo(() => initial.find((i) => i.id === facultyInstId), [initial, facultyInstId]);

  async function post(url: string, body: unknown) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 201) {
      setMsg({ ok: true, text: 'Saved.' });
      setOpenForm(null);
      router.refresh();
      return true;
    }
    setMsg({ ok: false, text: data.error ?? 'Something went wrong. Please try again.' });
    return false;
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row row--wrap spread">
        <p className="muted" style={{ margin: 0 }}>
          {initial.length} institution{initial.length === 1 ? '' : 's'} · expand carefully: only add institutions you intend to verify deeply.
        </p>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn--primary btn--sm" onClick={() => setOpenForm(openForm === 'institution' ? null : 'institution')}>+ Institution</button>
          <button className="btn btn--outline btn--sm" onClick={() => setOpenForm(openForm === 'faculty' ? null : 'faculty')}>+ Faculty</button>
          <button className="btn btn--outline btn--sm" onClick={() => setOpenForm(openForm === 'department' ? null : 'department')}>+ Department</button>
        </div>
      </div>

      {msg ? <div className={msg.ok ? 'form-success' : 'form-error'}>{msg.text}</div> : null}

      {openForm === 'institution' ? (
        <form className="card" onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          post('/api/admin/institutions', {
            name: f.get('name'), shortName: f.get('shortName') || '', type: f.get('type'), state: f.get('state'),
            city: f.get('city') || '', website: f.get('website') || '', admissionPortal: f.get('admissionPortal') || '',
            studentPortal: f.get('studentPortal') || '', about: f.get('about') || ''
          });
        }}>
          <h3 style={{ marginBottom: 10 }}>New institution</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="field"><label className="req">Full name</label><input name="name" required placeholder="e.g. University of Lagos" /></div>
            <div className="field"><label>Short name</label><input name="shortName" placeholder="e.g. UNILAG" /></div>
            <div className="field">
              <label className="req">Type</label>
              <select name="type"><option value="UNIVERSITY">University</option><option value="POLYTECHNIC">Polytechnic</option><option value="COLLEGE_OF_EDUCATION">College of Education</option></select>
            </div>
            <div className="field"><label className="req">State</label><input name="state" required placeholder="e.g. Lagos" /></div>
            <div className="field"><label>City</label><input name="city" placeholder="e.g. Akoka" /></div>
            <div className="field"><label>Website</label><input name="website" type="url" placeholder="https://…" /></div>
            <div className="field"><label>Admission portal</label><input name="admissionPortal" type="url" placeholder="https://…" /></div>
            <div className="field"><label>Student portal</label><input name="studentPortal" type="url" placeholder="https://…" /></div>
          </div>
          <div className="field"><label>About</label><textarea name="about" style={{ minHeight: 70 }} placeholder="Factual, neutral description." /></div>
          <button className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Create institution'}</button>
        </form>
      ) : null}

      {openForm === 'faculty' ? (
        <form className="card" onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          post(`/api/admin/institutions/${f.get('institutionId')}/faculties`, { name: f.get('name') });
        }}>
          <h3 style={{ marginBottom: 10 }}>Add faculty</h3>
          <div className="row row--wrap">
            <select name="institutionId" value={facultyInstId} onChange={(e) => setFacultyInstId(e.target.value)} className="input" style={{ maxWidth: 320 }}>
              {initial.map((i) => <option key={i.id} value={i.id}>{i.short_name ?? i.name}</option>)}
            </select>
            <input name="name" required className="input" style={{ maxWidth: 320 }} placeholder="e.g. Faculty of Pharmacy" />
            <button className="btn btn--primary" disabled={busy}>Add</button>
          </div>
        </form>
      ) : null}

      {openForm === 'department' ? (
        <form className="card" onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (!deptFacId) {
            setMsg({ ok: false, text: 'Choose a faculty first.' });
            return;
          }
          post(`/api/admin/faculties/${deptFacId}/departments`, { name: f.get('name') });
        }}>
          <h3 style={{ marginBottom: 10 }}>Add department</h3>
          <div className="row row--wrap">
            <select value={facultyInstId} onChange={(e) => { setFacultyInstId(e.target.value); setDeptFacId(''); }} className="input" style={{ maxWidth: 220 }} aria-label="Institution">
              {initial.map((i) => <option key={i.id} value={i.id}>{i.short_name ?? i.name}</option>)}
            </select>
            <select name="facultyId" value={deptFacId} onChange={(e) => setDeptFacId(e.target.value)} className="input" style={{ maxWidth: 260 }} aria-label="Faculty">
              <option value="">Choose faculty…</option>
              {(facultyInst?.faculties ?? []).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <input name="name" required className="input" style={{ maxWidth: 280 }} placeholder="e.g. Pharmacology" />
            <button className="btn btn--primary" disabled={busy}>Add</button>
          </div>
        </form>
      ) : null}

      {initial.map((inst) => (
        <section key={inst.id} className="card">
          <div className="card__title">
            <h3 style={{ fontSize: '1.05rem' }}>{inst.name}{inst.short_name ? ` (${inst.short_name})` : ''}</h3>
            <span className="small muted">{inst.type.replace(/_/g, ' ')} · {inst.state}</span>
          </div>
          {inst.faculties.length === 0 ? (
            <p className="small muted" style={{ margin: 0 }}>No faculties yet.</p>
          ) : (
            inst.faculties.map((f) => (
              <div key={f.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <strong style={{ fontSize: '0.92rem' }}>{f.name}</strong>
                <div className="pill-list mt-1">
                  {f.departments.length === 0
                    ? <span className="small muted">No departments</span>
                    : f.departments.map((d) => <span key={d.id} className="pill" style={{ cursor: 'default', padding: '2px 10px', fontSize: '0.8rem' }}>{d.name}</span>)}
                </div>
              </div>
            ))
          )}
        </section>
      ))}
    </div>
  );
}
