import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { LoginForm } from '@/components/auth-forms';

export const metadata: Metadata = { title: 'Log in' };
export const dynamic = 'force-dynamic';

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  if (getSessionUser()) redirect(searchParams.next || '/dashboard');

  return (
    <div className="container" style={{ maxWidth: 440, padding: '48px 16px' }}>
      <h1 style={{ fontSize: '1.8rem' }}>Welcome back</h1>
      <p className="muted">Log in to pick up where you left off.</p>
      <div className="card card--pad-lg mt-2">
        <LoginForm next={searchParams.next} />
      </div>
      <p className="small muted mt-2" style={{ textAlign: 'center' }}>
        New here? <Link href="/register">Create a free account</Link>
      </p>
    </div>
  );
}
