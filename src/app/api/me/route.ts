import { z } from 'zod';
import { destroyAllUserSessions, destroySession, verifyPassword } from '@/lib/auth';
import { fail, isGuardError, logAudit, ok, parseJson, requireApiUser, getClientIp } from '@/lib/api';
import { anonymizeUser } from '@/lib/data/users';

export const dynamic = 'force-dynamic';

const deleteSchema = z.object({ password: z.string().min(1, 'Please confirm your password.') });

/** §26: account deletion — confirmed by password; PII anonymized, sessions revoked. */
export async function DELETE(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const parsed = await parseJson(req, deleteSchema);
  if ('response' in parsed) return parsed.response;

  const valid = await verifyPassword(parsed.data.password, guard.session.user.password_hash);
  if (!valid) return fail(403, 'That password is not correct.');

  const userId = guard.session.user.id;
  logAudit({ userId, action: 'ACCOUNT_DELETED', ip: getClientIp(req) });
  anonymizeUser(userId);
  destroyAllUserSessions(userId);
  destroySession();
  return ok({ ok: true, message: 'Your account has been deleted. We are sorry to see you go.' });
}
