import { getClientIp, isGuardError, logAudit, ok, parseJson, requireApiRole } from '@/lib/api';
import { createCutOff } from '@/lib/data/content';
import { cutoffSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const guard = requireApiRole(req, 'ADMIN');
  if (isGuardError(guard)) return guard.response;

  const parsed = await parseJson(req, cutoffSchema);
  if ('response' in parsed) return parsed.response;
  const d = parsed.data;

  const id = createCutOff({
    institutionId: d.institutionId,
    programme: d.programme,
    faculty: d.faculty || null,
    utmeCutoff: d.utmeCutoff ?? null,
    departmentalCutoff: d.departmentalCutoff ?? null,
    session: d.session,
    category: d.category,
    status: 'PENDING',
    sourceName: d.sourceName,
    sourceUrl: d.sourceUrl || null,
    note: d.note || null
  });
  logAudit({ userId: guard.session.user.id, action: 'ADMIN_CREATE_CUTOFF', entity: 'cutoff', entityId: id, ip: getClientIp(req) });
  return ok({ ok: true, id }, 201);
}
