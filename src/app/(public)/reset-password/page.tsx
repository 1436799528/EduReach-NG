import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth-forms';

export const metadata: Metadata = { title: 'Choose a new password' };

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? '';
  return (
    <div className="container" style={{ maxWidth: 440, padding: '48px 16px' }}>
      <h1 style={{ fontSize: '1.8rem' }}>Choose a new password</h1>
      {token ? (
        <div className="card card--pad-lg mt-2">
          <ResetPasswordForm token={token} />
        </div>
      ) : (
        <div className="notice notice--warn mt-2">
          This reset link is missing its token. Please <Link href="/forgot-password">request a new reset link</Link>.
        </div>
      )}
    </div>
  );
}
