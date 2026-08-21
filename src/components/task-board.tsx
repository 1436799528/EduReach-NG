'use client';

import { useState } from 'react';
import { countdownLabel } from '@/lib/format';

export interface TaskItemLite {
  id: string;
  title: string;
  description: string | null;
  status: string;
  source: string;
  due_at: string | null;
}

export function TaskBoard({ initial }: { initial: TaskItemLite[] }) {
  const [items, setItems] = useState(initial);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() })
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 201) {
      setItems((prev) => [{ id: data.id, title: title.trim(), description: null, status: 'PENDING', source: 'MANUAL', due_at: null }, ...prev]);
      setTitle('');
    }
  }

  async function toggle(t: TaskItemLite) {
    const next = t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setItems((prev) => prev.map((i) => (i.id === t.id ? { ...i, status: next } : i)));
    await fetch(`/api/tasks/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    });
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  }

  const pending = items.filter((i) => i.status !== 'COMPLETED');
  const done = items.filter((i) => i.status === 'COMPLETED');

  return (
    <div className="stack" style={{ gap: 18 }}>
      <form onSubmit={create} className="row">
        <input
          className="input grow"
          placeholder="Add a task — e.g. Complete course registration"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          aria-label="New task title"
        />
        <button className="btn btn--primary" disabled={busy || !title.trim()}>Add</button>
      </form>

      {pending.length === 0 && done.length === 0 ? (
        <div className="card"><p className="muted" style={{ margin: 0 }}>No tasks yet. Small, clear tasks beat a cluttered head.</p></div>
      ) : null}

      {pending.length > 0 ? (
        <div className="card" style={{ padding: 8 }}>
          {pending.map((t) => (
            <div key={t.id} className="row" style={{ padding: '10px 8px', borderBottom: '1px solid var(--line)' }}>
              <input type="checkbox" aria-label={`Mark "${t.title}" complete`} onChange={() => toggle(t)} style={{ width: 20, height: 20, accentColor: 'var(--green)' }} />
              <span className="grow" style={{ fontWeight: 500 }}>{t.title}</span>
              {t.due_at ? <span className="countdown countdown--soon">{countdownLabel(t.due_at)}</span> : null}
              {t.source !== 'MANUAL' ? <span className="tag">{t.source.toLowerCase()}</span> : null}
              <button className="btn btn--danger-outline btn--sm" aria-label={`Delete ${t.title}`} onClick={() => remove(t.id)}>✕</button>
            </div>
          ))}
        </div>
      ) : null}

      {done.length > 0 ? (
        <div className="card" style={{ padding: 8, opacity: 0.75 }}>
          <div className="small muted" style={{ padding: '6px 8px' }}>Completed</div>
          {done.map((t) => (
            <div key={t.id} className="row" style={{ padding: '10px 8px', borderBottom: '1px solid var(--line)' }}>
              <input type="checkbox" checked readOnly onChange={() => toggle(t)} aria-label={`Reopen "${t.title}"`} style={{ width: 20, height: 20 }} />
              <span className="grow" style={{ textDecoration: 'line-through' }}>{t.title}</span>
              <button className="btn btn--danger-outline btn--sm" aria-label={`Delete ${t.title}`} onClick={() => remove(t.id)}>✕</button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
