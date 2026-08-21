import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth-forms';

export const metadata: Metadata = { title: 'Reset your password' };

export default function ForgotPasswordPage() {
  return (
    <div className="container" style={{ maxWidth: 440, padding: '48px 16px' }}>
      <h1 style={{ fontSize: '1.8rem' }}>Forgot your password?</h1>
      <p className="muted">No wahala. Enter your email and we&apos;ll send a reset link.</p>
      <div className="card card--pad-lg mt-2">
        <ForgotPasswordForm />
      </div>
      <p className="small muted mt-2" style={{ textAlign: 'center' }}>
        Remembered it? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
