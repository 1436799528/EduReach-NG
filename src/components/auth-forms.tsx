'use client';

import { useState } from 'react';
import Link from 'next/link';

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

export function LoginForm({ next }: { next?: string }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { status, data } = await post('/api/auth/login', {
      email: form.get('email'),
      password: form.get('password')
    });
    setBusy(false);
    if (status !== 200) {
      setError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }
    window.location.href = next || data.next || '/dashboard';
  }

  return (
    <form onSubmit={onSubmit} className="stack" noValidate={false}>
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Your password" />
      </div>
      <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      <p className="small muted" style={{ textAlign: 'center', margin: 0 }}>
        <Link href="/forgot-password">Forgot your password?</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [error, setError] = useState('');
  const [devUrl, setDevUrl] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') ?? '');
    const confirm = String(form.get('confirm') ?? '');
    if (password !== confirm) {
      setBusy(false);
      setError('Passwords do not match.');
      return;
    }
    const { status, data } = await post('/api/auth/register', {
      fullName: form.get('fullName'),
      email: form.get('email'),
      phone: form.get('phone'),
      password
    });
    setBusy(false);
    if (status !== 201) {
      setError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }
    if (data.devVerifyUrl) setDevUrl(data.devVerifyUrl);
    window.location.href = data.next || '/onboarding';
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      {devUrl ? (
        <div className="form-success">
          Dev mode: <a href={devUrl}>verify your email now</a> (in production this link is emailed to you).
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="fullName" className="req">Full name</label>
        <input id="fullName" name="fullName" type="text" autoComplete="name" required placeholder="e.g. Adaeze Okafor" />
      </div>
      <div className="field">
        <label htmlFor="email" className="req">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone number <span className="hint">(optional)</span></label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="e.g. 0803 000 0000" />
      </div>
      <div className="field">
        <label htmlFor="password" className="req">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" />
      </div>
      <div className="field">
        <label htmlFor="confirm" className="req">Confirm password</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} placeholder="Repeat your password" />
      </div>
      <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Creating account…' : 'Create free account'}</button>
      <p className="small muted" style={{ margin: 0 }}>
        By creating an account you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy policy</Link>.
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [done, setDone] = useState<{ message: string; devResetUrl?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { data } = await post('/api/auth/forgot-password', { email: form.get('email') });
    setBusy(false);
    setDone({ message: data.message ?? 'If an account exists for that email, we have sent a password reset link.', devResetUrl: data.devResetUrl });
  }

  if (done) {
    return (
      <div className="form-success">
        <p style={{ margin: 0 }}>{done.message}</p>
        {done.devResetUrl ? (
          <p style={{ margin: '8px 0 0' }}>Dev mode: <a href={done.devResetUrl}>open the reset link</a></p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        <span className="hint">We&apos;ll send a reset link if an account exists for this email.</span>
      </div>
      <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') ?? '');
    if (password !== String(form.get('confirm') ?? '')) {
      setBusy(false);
      setError('Passwords do not match.');
      return;
    }
    const { status, data } = await post('/api/auth/reset-password', { token, password });
    setBusy(false);
    if (status !== 200) {
      setError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }
    window.location.href = data.next || '/login';
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      {error ? <div className="form-error" role="alert">{error}</div> : null}
      <div className="field">
        <label htmlFor="password">New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" />
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirm new password</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Updating…' : 'Set new password'}</button>
    </form>
  );
}
