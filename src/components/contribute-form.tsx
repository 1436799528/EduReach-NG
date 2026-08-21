'use client';

import { useState } from 'react';

export function ContributeForm({ institutions }: { institutions: { id: string; name: string; shortName: string | null }[] }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch('/api/contribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'),
        summary: form.get('summary'),
        body: form.get('body') || '',
        category: form.get('category'),
        institutionId: form.get('institutionId') || '',
        sourceName: form.get('sourceName') || '',
        sourceUrl: form.get('sourceUrl') || ''
      })
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 201) {
      setDone(true);
      formEl.reset();
    } else {
      setError(data.error ?? 'Something went wrong. Please try again.');
    }
  }

  if (done) {
    return (
      <div className="card card--pad-lg" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.2rem' }}>Submitted for verification ✓</h2>
        <p className="muted">
          An editor will check it against the official source before anything is published. That is how this
          platform stays trustworthy.
        </p>
        <button className="btn btn--outline" onClick={() => setDone(false)}>Submit another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card card--pad-lg">
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <div className="field">
        <label className="req" htmlFor="c-title">What&apos;s happening?</label>
        <input id="c-title" name="title" required minLength={6} maxLength={300} placeholder="e.g. UNICAL second-semester registration closes Friday" />
      </div>
      <div className="field">
        <label className="req" htmlFor="c-summary">Short summary</label>
        <textarea id="c-summary" name="summary" required minLength={10} maxLength={500} style={{ minHeight: 70 }} placeholder="The key facts in one or two sentences — what, who it affects, when." />
      </div>
      <div className="field">
        <label htmlFor="c-body">Full details <span className="hint">(optional)</span></label>
        <textarea id="c-body" name="body" style={{ minHeight: 120 }} maxLength={20000} placeholder="Everything you know, including where you saw it." />
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="field">
          <label className="req" htmlFor="c-cat">Category</label>
          <select id="c-cat" name="category">
            <option value="REGISTRATION">Registration</option>
            <option value="EXAMINATIONS">Examinations</option>
            <option value="RESULTS">Results</option>
            <option value="FEES">Fees</option>
            <option value="ADMISSION">Admission</option>
            <option value="JAMB">JAMB</option>
            <option value="SIWES">SIWES</option>
            <option value="OPPORTUNITY">Opportunity</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="c-inst">Institution</label>
          <select id="c-inst" name="institutionId">
            <option value="">National / unsure</option>
            {institutions.map((i) => <option key={i.id} value={i.id}>{i.shortName ?? i.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="c-src">Source name <span className="hint">(optional)</span></label>
          <input id="c-src" name="sourceName" maxLength={200} placeholder="e.g. Departmental notice board" />
        </div>
        <div className="field">
          <label htmlFor="c-url">Source link <span className="hint">(optional)</span></label>
          <input id="c-url" name="sourceUrl" type="url" placeholder="https://…" />
        </div>
      </div>
      <button className="btn btn--primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit for verification'}</button>
    </form>
  );
}
