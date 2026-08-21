import { z } from 'zod';
import { fail, getClientIp, isGuardError, logAudit, ok, parseJson, requireApiRole } from '@/lib/api';
import { findResource, resolveReport, setResourceStatus } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

const patchSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  resolveReportId: z.string().optional(),
  reportOutcome: z.enum(['RESOLVED', 'DISMISSED']).optional()
});

/** MODERATOR+ moderate resources; report resolution included. */
export async function PATCH(req: Request, { params }: Ctx) {
  const guard = requireApiRole(req, 'MODERATOR');
  if (isGuardError(guard)) return guard.response;

  const resource = findResource(params.id);
  if (!resource) return fail(404, 'Resource not found.');

  const parsed = await parseJson(req, patchSchema);
  if ('response' in parsed) return parsed.response;

  if (parsed.data.status) {
    setResourceStatus(params.id, parsed.data.status);
    logAudit({ userId: guard.session.user.id, action: 'MOD_RESOURCE_STATUS', entity: 'resource', entityId: params.id, detail: parsed.data.status, ip: getClientIp(req) });
  }
  if (parsed.data.resolveReportId && parsed.data.reportOutcome) {
    resolveReport(parsed.data.resolveReportId, parsed.data.reportOutcome);
    logAudit({ userId: guard.session.user.id, action: 'MOD_REPORT_RESOLVED', entity: 'resource_report', entityId: parsed.data.resolveReportId, ip: getClientIp(req) });
  }
  return ok({ ok: true });
}
