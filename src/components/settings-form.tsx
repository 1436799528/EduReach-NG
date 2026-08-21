'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LEVELS, STUDENT_STATUSES } from '@/lib/validation';

interface Named { id: string; name: string }

interface Initial {
  fullName: string;
  email: string;
  phone: string;
  institutionId: string;
  facultyId: string;
  departmentId: string;
  level: string;
  programme: string;
  semester: string;
  currentCgpa: string;
  studentStatus: string;
  notifyEmail: boolean;
  notifyInApp: boolean;
}

export function SettingsForm({
  initial,
  institutions,
  facultiesByInst,
  departmentsByFac
}: {
  initial: Initial;
  institutions: { id: string; name: string; shortName: string | null }[];
  facultiesByInst: Record<string, Named[]>;
  departmentsByFac: Record<string, Named[]>;
}) {
  const router = useRouter();
  const [institutionId, setInstitutionId] = useState(initial.institutionId);
  const [facultyId, setFacultyId] = useState(initial.facultyId);
  const [departmentId, setDepartmentId] = useState(initial.departmentId);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const faculties = useMemo(() => facultiesByInst[institutionId] ?? [], [institutionId, facultiesByInst]);
  const departments = useMemo(() => departmentsByFac[facultyId] ?? [], [facultyId, departmentsByFac]);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institutionId, facultyId, departmentId,
        level: form.get('level') || '',
        programme: form.get('programme') || '',
        semester: form.get('semester') || '',
        currentCgpa: form.get('currentCgpa') ? Number(form.get('currentCgpa')) : null,
        studentStatus: form.get('studentStatus') || '',
        phone: form.get('phone') || ''
      })
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setMsg({ ok: res.status === 200, text: res.status === 200 ? 'Saved.' : (data.error ?? 'Could not save. Please try again.') });
    router.refresh();
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    if (form.get('next') !== form.get('confirm')) {
      setBusy(false);
      setMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    const res = await fetch('/api/me/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: form.get('current'), next: form.get('next') })
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status !== 200) {
      setMsg({ ok: false, text: data.error ?? 'Could not change password.' });
      return;
    }
    setMsg({ ok: true, text: 'Password changed — logging you out everywhere.' });
    setTimeout(() => {
      window.location.href = '/login';
    }, 1200);
    formEl.reset();
  }

  async function deleteAccount() {
    const password = window.prompt('This permanently deletes your account. Type your password to confirm:');
    if (!password) return;
    const res = await fetch('/api/me', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.status === 200) {
      window.location.href = '/';
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg({ ok: false, text: data.error ?? 'Could not delete account.' });
    }
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      {msg ? <div className={msg.ok ? 'form-success' : 'form-error'} role="status">{msg.text}</div> : null}

      <form onSubmit={saveProfile} className="card">
        <div className="card__title"><h3>Academic profile</h3></div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="field"><label>Full name</label><input value={initial.fullName} disabled /><span className="hint">Name changes: contact support.</span></div>
          <div className="field"><label>Email</label><input value={initial.email} disabled /></div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="field">
            <label htmlFor="s-inst">Institution</label>
            <select id="s-inst" value={institutionId} onChange={(e) => { setInstitutionId(e.target.value); setFacultyId(''); setDepartmentId(''); }}>
              <option value="">Not set</option>
              {institutions.map((i) => <option key={i.id} value={i.id}>{i.shortName ? `${i.name} (${i.shortName})` : i.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-fac">Faculty</label>
            <select id="s-fac" value={facultyId} onChange={(e) => { setFacultyId(e.target.value); setDepartmentId(''); }}>
              <option value="">Not set</option>
              {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-dept">Department</label>
            <select id="s-dept" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Not set</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-level">Level</label>
            <select id="s-level" name="level" defaultValue={initial.level}>
              <option value="">Not set</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l} level</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-sem">Semester</label>
            <select id="s-sem" name="semester" defaultValue={initial.semester}>
              <option value="">Not set</option>
              <option value="FIRST">First semester</option>
              <option value="SECOND">Second semester</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="s-status">Student status</label>
            <select id="s-status" name="studentStatus" defaultValue={initial.studentStatus}>
              <option value="">Not set</option>
              {STUDENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="s-prog">Programme</label><input id="s-prog" name="programme" defaultValue={initial.programme} placeholder="e.g. B.Sc. Computer Science" /></div>
          <div className="field"><label htmlFor="s-cgpa">Current CGPA</label><input id="s-cgpa" name="currentCgpa" type="number" min="0" max="7" step="0.01" defaultValue={initial.currentCgpa} /></div>
          <div className="field"><label htmlFor="s-phone">Phone</label><input id="s-phone" name="phone" type="tel" defaultValue={initial.phone} /></div>
        </div>
        <button className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
      </form>

      <form onSubmit={changePassword} className="card">
        <div className="card__title"><h3>Change password</h3></div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="field"><label htmlFor="pw-cur" className="req">Current password</label><input id="pw-cur" name="current" type="password" required autoComplete="current-password" /></div>
          <div className="field"><label htmlFor="pw-next" className="req">New password</label><input id="pw-next" name="next" type="password" required minLength={8} autoComplete="new-password" /></div>
          <div className="field"><label htmlFor="pw-con" className="req">Confirm new</label><input id="pw-con" name="confirm" type="password" required minLength={8} autoComplete="new-password" /></div>
        </div>
        <button className="btn btn--outline" disabled={busy}>Change password</button>
      </form>

      <div className="card">
        <div className="card__title"><h3>Your data</h3></div>
        <p className="small muted">Your information belongs to you. Export everything we hold about your account, or delete your account entirely.</p>
        <div className="row row--wrap">
          <a className="btn btn--outline btn--sm" href="/api/me/export" download>Export my data (JSON)</a>
          <button className="btn btn--danger-outline btn--sm" onClick={deleteAccount}>Delete my account</button>
        </div>
      </div>
    </div>
  );
}
