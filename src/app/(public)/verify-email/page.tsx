import type { Metadata } from 'next';
import Link from 'next/link';
import { consumeEmailToken, getSessionUser } from '@/lib/auth';
import { markEmailVerified } from '@/lib/data/users';
import { logAudit } from '@/lib/api';
import { ResendVerification } from '@/components/verify-client';

export const metadata: Metadata = { title: 'Verify your email' };
export const dynamic = 'force-dynamic';

export default function VerifyEmailPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? '';
  let outcome: 'verified' | 'invalid' | 'idle' = 'idle';

  if (token) {
    const userId = consumeEmailToken(token, 'VERIFY_EMAIL');
    if (userId) {
      markEmailVerified(userId);
      logAudit({ userId, action: 'AUTH_EMAIL_VERIFIED' });
      outcome = 'verified';
    } else {
      outcome = 'invalid';
    }
  }

  const session = getSessionUser();

  return (
    <div className="container" style={{ maxWidth: 520, padding: '48px 16px' }}>
      <h1 style={{ fontSize: '1.8rem' }}>Email verification</h1>

      {outcome === 'verified' ? (
        <div className="notice notice--ok mt-2">
          <strong>Your email is verified.</strong> You&apos;re all set — enjoy full access.
          <div className="mt-1"><Link className="btn btn--primary btn--sm" href="/dashboard">Go to dashboard</Link></div>
        </div>
      ) : null}

      {outcome === 'invalid' ? (
        <div className="notice notice--warn mt-2">
          This verification link is invalid or has expired. Request a fresh one below.
        </div>
      ) : null}

      <div className="card mt-2">
        {session ? (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              Signed in as <strong>{session.user.email}</strong>
              {session.user.email_verified_at ? ' — already verified ✓' : ''}.
            </p>
            {!session.user.email_verified_at ? <ResendVerification /> : null}
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            <Link href="/login">Log in</Link> to request a new verification link.
          </p>
        )}
      </div>
    </div>
  );
}
