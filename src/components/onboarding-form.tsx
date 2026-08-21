'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LEVELS, STUDENT_STATUSES } from '@/lib/validation';

interface InstOpt { id: string; name: string; shortName: string | null }
interface Named { id: string; name: string }

export function OnboardingForm({
  institutions,
  facultiesByInst,
  departmentsByFac,
  initial
}: {
  institutions: InstOpt[];
  facultiesByInst: Record<string, Named[]>;
  departmentsByFac: Record<string, Named[]>;
  initial: {
    institution_id: string | null; faculty_id: string | null; department_id: string | null;
    level: string | null; programme: string | null; semester: string | null;
    current_cgpa: number | null; student_status: string | null;
  } | null;
}) {
  const router = useRouter();
  const [institutionId, setInstitutionId] = useState(initial?.institution_id ?? '');
  const [facultyId, setFacultyId] = useState(initial?.faculty_id ?? '');
  const [departmentId, setDepartmentId] = useState(initial?.department_id ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const faculties = useMemo(() => facultiesByInst[institutionId] ?? [], [institutionId, facultiesByInst]);
  const departments = useMemo(() => departmentsByFac[facultyId] ?? [], [facultyId, departmentsByFac]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        institutionId,
        facultyId,
        departmentId,
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
    if (res.status !== 200) {
      setError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      {error ? <div className="form-error" role="alert">{error}</div> : null}

      <div className="field">
        <label htmlFor="studentStatus">What best describes you right now?</label>
        <select id="studentStatus" name="studentStatus" defaultValue={initial?.student_status ?? ''}>
          <option value="">Choose…</option>
          {STUDENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="institution">Your institution</label>
        <select
          id="institution"
          value={institutionId}
          onChange={(e) => { setInstitutionId(e.target.value); setFacultyId(''); setDepartmentId(''); }}
        >
          <option value="">Choose…</option>
          {institutions.map((i) => <option key={i.id} value={i.id}>{i.shortName ? `${i.name} (${i.shortName})` : i.name}</option>)}
        </select>
        <span className="hint">More institutions are being added — UNICAL is fully live.</span>
      </div>

      {faculties.length > 0 ? (
        <div className="field">
          <label htmlFor="faculty">Faculty</label>
          <select id="faculty" value={facultyId} onChange={(e) => { setFacultyId(e.target.value); setDepartmentId(''); }}>
            <option value="">Choose…</option>
            {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      ) : null}

      {departments.length > 0 ? (
        <div className="field">
          <label htmlFor="department">Department</label>
          <select id="department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">Choose…</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      ) : null}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label htmlFor="level">Level</label>
          <select id="level" name="level" defaultValue={initial?.level ?? ''}>
            <option value="">Choose…</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l} level</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="semester">Current semester</label>
          <select id="semester" name="semester" defaultValue={initial?.semester ?? ''}>
            <option value="">Choose…</option>
            <option value="FIRST">First semester</option>
            <option value="SECOND">Second semester</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="programme">Programme <span className="hint">(optional)</span></label>
        <input id="programme" name="programme" placeholder="e.g. B.Sc. Computer Science" defaultValue={initial?.programme ?? ''} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label htmlFor="currentCgpa">Current CGPA <span className="hint">(optional)</span></label>
          <input id="currentCgpa" name="currentCgpa" type="number" min="0" max="7" step="0.01" placeholder="e.g. 3.42" defaultValue={initial?.current_cgpa ?? ''} />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone <span className="hint">(optional)</span></label>
          <input id="phone" name="phone" type="tel" placeholder="e.g. 0803 000 0000" />
        </div>
      </div>

      <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Saving…' : 'Save and continue'}</button>
    </form>
  );
}
