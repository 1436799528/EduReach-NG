import { createEmailToken } from '@/lib/auth';
import { getClientIp, isGuardError, ok, rateLimit, requireApiUser, tooMany } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const rl = rateLimit(`verify-send:${guard.session.user.id}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const token = createEmailToken(guard.session.user.id, 'VERIFY_EMAIL', 24 * 60);
  return ok({
    ok: true,
    // Development mode: no email provider configured, so surface the link directly.
    ...(process.env.NODE_ENV !== 'production' ? { devVerifyUrl: `/verify-email?token=${token}` } : {})
  });
}
