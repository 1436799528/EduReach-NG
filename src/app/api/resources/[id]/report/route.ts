import { fail, getClientIp, isGuardError, logAudit, ok, parseJson, rateLimit, requireApiUser, tooMany } from '@/lib/api';
import { createResourceReport, findResource } from '@/lib/data/content';
import { reportSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function POST(req: Request, { params }: Ctx) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const rl = rateLimit(`report:${guard.session.user.id}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const resource = findResource(params.id);
  if (!resource) return fail(404, 'Resource not found.');

  const parsed = await parseJson(req, reportSchema);
  if ('response' in parsed) return parsed.response;

  createResourceReport(resource.id, guard.session.user.id, parsed.data.reason);
  logAudit({ userId: guard.session.user.id, action: 'RESOURCE_REPORTED', entity: 'resource', entityId: resource.id, ip: getClientIp(req) });
  return ok({ ok: true, message: 'Reported. A moderator will review it.' }, 201);
}
