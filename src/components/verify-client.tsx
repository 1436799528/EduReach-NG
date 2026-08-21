'use client';

import { useState } from 'react';

export function ResendVerification() {
  const [msg, setMsg] = useState('');
  const [devUrl, setDevUrl] = useState('');
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    const res = await fetch('/api/auth/send-verification', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status !== 200) {
      setMsg(data.error ?? 'Something went wrong. Please try again.');
      return;
    }
    setMsg('Verification link created.');
    if (data.devVerifyUrl) setDevUrl(data.devVerifyUrl);
  }

  return (
    <div className="stack">
      <button className="btn btn--primary" onClick={resend} disabled={busy}>
        {busy ? 'Sending…' : 'Send me a verification link'}
      </button>
      {msg ? <p className="small muted" style={{ margin: 0 }}>{msg}</p> : null}
      {devUrl ? (
        <p className="small" style={{ margin: 0 }}>
          Dev mode: <a href={devUrl}>click to verify now</a>
        </p>
      ) : null}
    </div>
  );
}
