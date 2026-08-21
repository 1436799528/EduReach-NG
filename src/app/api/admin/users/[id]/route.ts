import { destroyAllUserSessions } from '@/lib/auth';
import { fail, getClientIp, isGuardError, logAudit, ok, parseJson, requireApiRole } from '@/lib/api';
import { setUserRole, setUserStatus } from '@/lib/data/users';
import { rolePatchSchema } from '@/lib/validation';
import { one } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

/** Role & status changes are SUPER_ADMIN territory only (§8, §24). */
export async function PATCH(req: Request, { params }: Ctx) {
  const guard = requireApiRole(req, 'SUPER_ADMIN');
  if (isGuardError(guard)) return guard.response;

  const target = one<{ id: string }>('SELECT id FROM users WHERE id = ?', [params.id]);
  if (!target) return fail(404, 'User not found.');

  const parsed = await parseJson(req, rolePatchSchema);
  if ('response' in parsed) return parsed.response;
  const { role, status } = parsed.data;

  if (role) setUserRole(params.id, role);
  if (status) {
    setUserStatus(params.id, status);
    if (status === 'SUSPENDED') destroyAllUserSessions(params.id);
  }
  logAudit({
    userId: guard.session.user.id,
    action: 'ADMIN_USER_CHANGED',
    entity: 'user',
    entityId: params.id,
    detail: JSON.stringify({ role, status }),
    ip: getClientIp(req)
  });
  return ok({ ok: true });
}
