import { consumeEmailToken, destroyAllUserSessions, hashPassword } from '@/lib/auth';
import { updatePassword } from '@/lib/data/users';
import { fail, getClientIp, logAudit, ok, parseJson, rateLimit, tooMany } from '@/lib/api';
import { passwordResetSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`reset:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const parsed = await parseJson(req, passwordResetSchema);
  if ('response' in parsed) return parsed.response;

  const userId = consumeEmailToken(parsed.data.token, 'PASSWORD_RESET');
  if (!userId) return fail(400, 'This reset link is invalid or has expired. Please request a new one.');

  updatePassword(userId, await hashPassword(parsed.data.password));
  destroyAllUserSessions(userId);
  logAudit({ userId, action: 'AUTH_PASSWORD_RESET', ip });
  return ok({ ok: true, message: 'Password updated. You can now log in with your new password.', next: '/login' });
}
