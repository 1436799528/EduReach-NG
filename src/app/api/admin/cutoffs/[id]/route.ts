import { z } from 'zod';
import { fail, getClientIp, isGuardError, logAudit, ok, parseJson, requireApiRole } from '@/lib/api';
import { deleteCutOff, setCutOffStatus } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

const patchSchema = z.object({ status: z.enum(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'OUTDATED', 'ARCHIVED']) });

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = requireApiRole(req, 'ADMIN');
  if (isGuardError(guard)) return guard.response;
  const parsed = await parseJson(req, patchSchema);
  if ('response' in parsed) return parsed.response;
  setCutOffStatus(params.id, parsed.data.status);
  logAudit({ userId: guard.session.user.id, action: 'ADMIN_CUTOFF_STATUS', entity: 'cutoff', entityId: params.id, detail: parsed.data.status, ip: getClientIp(req) });
  return ok({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const guard = requireApiRole(req, 'ADMIN');
  if (isGuardError(guard)) return guard.response;
  deleteCutOff(params.id);
  logAudit({ userId: guard.session.user.id, action: 'ADMIN_DELETE_CUTOFF', entity: 'cutoff', entityId: params.id, ip: getClientIp(req) });
  return ok({ ok: true });
}
