import { createEmailToken, findUserByEmail } from '@/lib/auth';
import { isRealEmailConfigured, sendPasswordResetEmail } from '@/lib/email/provider';
import { getClientIp, logAudit, ok, parseJson, rateLimit, tooMany } from '@/lib/api';
import { passwordResetRequestSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const parsed = await parseJson(req, passwordResetRequestSchema);
  if ('response' in parsed) return parsed.response;

  const user = findUserByEmail(parsed.data.email);
  let devResetUrl: string | undefined;
  if (user && user.status === 'ACTIVE') {
    const token = createEmailToken(user.id, 'PASSWORD_RESET', 60);
    const url = `${new URL(req.url).origin}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, url);
    logAudit({ userId: user.id, action: 'AUTH_RESET_REQUESTED', ip });
    if (process.env.NODE_ENV !== 'production' && !isRealEmailConfigured()) {
      devResetUrl = `/reset-password?token=${token}`;
    }
  }

  // Identical response whether or not the account exists (no enumeration).
  return ok({
    ok: true,
    message: 'If an account exists for that email, we have sent a password reset link.',
    ...(devResetUrl ? { devResetUrl } : {})
  });
}
