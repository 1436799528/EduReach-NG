import { z } from 'zod';
import { destroyAllUserSessions, hashPassword, verifyPassword } from '@/lib/auth';
import { fail, getClientIp, isGuardError, logAudit, ok, parseJson, rateLimit, requireApiUser, tooMany } from '@/lib/api';
import { updatePassword } from '@/lib/data/users';

export const dynamic = 'force-dynamic';

const schema = z.object({
  current: z.string().min(1, 'Please enter your current password.'),
  next: z.string().min(8, 'New password must be at least 8 characters.').max(72)
});

export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const rl = rateLimit(`pw-change:${guard.session.user.id}`, 8, 60 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const parsed = await parseJson(req, schema);
  if ('response' in parsed) return parsed.response;

  const valid = await verifyPassword(parsed.data.current, guard.session.user.password_hash);
  if (!valid) return fail(403, 'Your current password is not correct.');

  updatePassword(guard.session.user.id, await hashPassword(parsed.data.next));
  destroyAllUserSessions(guard.session.user.id); // forces re-login everywhere
  logAudit({ userId: guard.session.user.id, action: 'AUTH_PASSWORD_CHANGED', ip: getClientIp(req) });
  return ok({ ok: true, message: 'Password updated. Please log in again with your new password.' });
}
