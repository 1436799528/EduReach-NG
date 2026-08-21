'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { countdownLabel, daysUntil, fmtDate, fmtDateLong } from '@/lib/format';
import { DEADLINE_TYPES, PRIORITIES } from '@/lib/validation';

export interface DeadlineItem {
  id: string;
  type: string;
  title: string;
  course: string | null;
  due_at: string;
  location: string | null;
  description: string | null;
  priority: string;
  status: string;
}

const TYPE_ICONS: Record<string, string> = {
  EXAM: '📝', TEST: '✏️', ASSIGNMENT: '📄', PROJECT: '🎓', REGISTRATION: '🗂️', FEE: '💳', SIWES: '🏢', CLEARANCE: '✅', OTHER: '📌'
};

export function DeadlineBoard({ initial }: { initial: DeadlineItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const pending = items.filter((i) => i.status === 'PENDING');
    const overdue = pending.filter((i) => daysUntil(i.due_at) < 0);
    const upcoming = pending.filter((i) => daysUntil(i.due_at) >= 0);
    const done = items.filter((i) => i.status !== 'PENDING');
    return { upcoming, overdue, done };
  }, [items]);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: form.get('type'),
        title: form.get('title'),
        course: form.get('course'),
        dueAt: form.get('dueAt'),
        time: form.get('time'),
        location: form.get('location'),
        description: form.get('description'),
        priority: form.get('priority'),
        remindDays: Number(form.get('remindDays') ?? 2)
      })
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status !== 201) {
      setError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }
    setShowForm(false);
    router.refresh();
    // Optimistic local append
    setItems((prev) => [
      ...prev,
      {
        id: data.id,
        type: String(form.get('type')),
        title: String(form.get('title')),
        course: String(form.get('course') ?? '') || null,
        due_at: new Date(String(form.get('dueAt')) + (form.get('time') ? `T${form.get('time')}:00` : 'T09:00:00')).toISOString(),
        location: String(form.get('location') ?? '') || null,
        description: String(form.get('description') ?? '') || null,
        priority: String(form.get('priority') ?? 'MEDIUM'),
        status: 'PENDING'
      }
    ].sort((a, b) => a.due_at.localeCompare(b.due_at)));
    e.currentTarget.reset();
  }

  async function setStatus(id: string, status: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    await fetch(`/api/deadlines/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/deadlines/${id}`, { method: 'DELETE' });
  }

  function Row({ d }: { d: DeadlineItem }) {
    const label = countdownLabel(d.due_at);
    const days = daysUntil(d.due_at);
    const cls = d.status !== 'PENDING' ? '' : days < 0 ? 'countdown--late' : days <= 1 ? 'countdown--today' : days <= 7 ? 'countdown--soon' : '';
    return (
      <div className="attention-item">
        <span style={{ fontSize: 22 }} aria-hidden="true">{TYPE_ICONS[d.type] ?? '📌'}</span>
        <span className="grow">
          <strong style={d.status !== 'PENDING' ? { textDecoration: 'line-through', opacity: 0.65 } : undefined}>{d.title}</strong>
          <div className="small muted">
            {d.type.replace(/_/g, ' ')}{d.course ? ` · ${d.course}` : ''} · {fmtDateLong(d.due_at)}
            {d.location ? ` · ${d.location}` : ''} · {d.priority.toLowerCase()} priority
          </div>
          {d.description ? <div className="small muted">{d.description}</div> : null}
        </span>
        <span className={`countdown ${cls}`}>{d.status === 'COMPLETED' ? 'Done' : d.status === 'MISSED' ? 'Missed' : label}</span>
        <span className="row" style={{ gap: 4 }}>
          {d.status === 'PENDING' ? (
            <>
              <button className="btn btn--ghost btn--sm" onClick={() => setStatus(d.id, 'COMPLETED')}>Done</button>
              <button className="btn btn--ghost btn--sm" onClick={() => setStatus(d.id, 'MISSED')}>Missed</button>
            </>
          ) : (
            <button className="btn btn--ghost btn--sm" onClick={() => setStatus(d.id, 'PENDING')}>Reopen</button>
          )}
          <button className="btn btn--danger-outline btn--sm" aria-label={`Delete ${d.title}`} onClick={() => remove(d.id)}>✕</button>
        </span>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row spread">
        <p className="muted" style={{ margin: 0 }}>{groups.upcoming.length} upcoming · {groups.overdue.length} overdue · {groups.done.length} closed</p>
        <button className="btn btn--primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close' : '+ Add item'}
        </button>
      </div>

      {showForm ? (
        <form className="card" onSubmit={create}>
          <h3 style={{ marginBottom: 12 }}>Track something new</h3>
          {error ? <div className="form-error" role="alert">{error}</div> : null}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="field">
              <label className="req" htmlFor="type">Type</label>
              <select id="type" name="type" defaultValue="EXAM">
                {DEADLINE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="req" htmlFor="title">Title</label>
              <input id="title" name="title" required placeholder="e.g. CSC 301 exam" maxLength={200} />
            </div>
            <div className="field">
              <label htmlFor="course">Course <span className="hint">(optional)</span></label>
              <input id="course" name="course" placeholder="e.g. CSC 301" maxLength={60} />
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <div className="field">
              <label className="req" htmlFor="dueAt">Date</label>
              <input id="dueAt" name="dueAt" type="date" required />
            </div>
            <div className="field">
              <label htmlFor="time">Time <span className="hint">(optional)</span></label>
              <input id="time" name="time" type="time" />
            </div>
            <div className="field">
              <label htmlFor="location">Location <span className="hint">(optional)</span></label>
              <input id="location" name="location" placeholder="e.g. Exam Hall A" maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" defaultValue="MEDIUM">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="remindDays">Remind</label>
              <select id="remindDays" name="remindDays" defaultValue="2">
                <option value="0">On the day</option>
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
                <option value="7">1 week before</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="description">Notes <span className="hint">(optional)</span></label>
            <textarea id="description" name="description" style={{ minHeight: 70 }} maxLength={2000} placeholder="Anything you shouldn't forget…" />
          </div>
          <button className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Add to tracker'}</button>
        </form>
      ) : null}

      {groups.overdue.length > 0 ? (
        <section>
          <div className="divider-label" style={{ color: 'var(--red)' }}>Overdue</div>
          {groups.overdue.map((d) => <Row key={d.id} d={d} />)}
        </section>
      ) : null}

      <section>
        <div className="divider-label">Upcoming</div>
        {groups.upcoming.length === 0 ? (
          <div className="card"><p className="muted" style={{ margin: 0 }}>Nothing tracked yet. Add your exams, tests, registration and fee deadlines.</p></div>
        ) : (
          groups.upcoming.map((d) => <Row key={d.id} d={d} />)
        )}
      </section>

      {groups.done.length > 0 ? (
        <section>
          <div className="divider-label">Completed / missed</div>
          {groups.done.map((d) => <Row key={d.id} d={d} />)}
        </section>
      ) : null}
    </div>
  );
}
