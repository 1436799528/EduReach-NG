import { createEmailToken } from '@/lib/auth';
import { isRealEmailConfigured, sendVerificationEmail } from '@/lib/email/provider';
import { isGuardError, ok, rateLimit, requireApiUser, tooMany } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const rl = rateLimit(`verify-send:${guard.session.user.id}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const token = createEmailToken(guard.session.user.id, 'VERIFY_EMAIL', 24 * 60);
  await sendVerificationEmail(
    guard.session.user.email,
    guard.session.user.full_name,
    `${new URL(req.url).origin}/verify-email?token=${token}`
  );

  return ok({
    ok: true,
    ...(process.env.NODE_ENV !== 'production' && !isRealEmailConfigured()
      ? { devVerifyUrl: `/verify-email?token=${token}` }
      : {})
  });
}
