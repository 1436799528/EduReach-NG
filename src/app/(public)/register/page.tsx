import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { RegisterForm } from '@/components/auth-forms';

export const metadata: Metadata = { title: 'Create your account' };
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  if (getSessionUser()) redirect('/dashboard');

  return (
    <div className="container" style={{ maxWidth: 480, padding: '48px 16px' }}>
      <h1 style={{ fontSize: '1.8rem' }}>Create your free account</h1>
      <p className="muted">Everything you need to navigate tertiary education in Nigeria.</p>
      <div className="card card--pad-lg mt-2">
        <RegisterForm />
      </div>
      <p className="small muted mt-2" style={{ textAlign: 'center' }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
