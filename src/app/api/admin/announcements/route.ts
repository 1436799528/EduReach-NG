import { getClientIp, isGuardError, logAudit, ok, parseJson, requireApiRole } from '@/lib/api';
import { createAnnouncement } from '@/lib/data/content';
import { fanOutAnnouncementNotification } from '@/lib/data/workspace';
import { announcementSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** ADMIN+ creates announcements. Publishing (VERIFIED) triggers notification fan-out. */
export async function POST(req: Request) {
  const guard = requireApiRole(req, 'ADMIN');
  if (isGuardError(guard)) return guard.response;

  const parsed = await parseJson(req, announcementSchema);
  if ('response' in parsed) return parsed.response;
  const d = parsed.data;
  const status = d.status ?? 'PENDING';

  const effectiveDate = d.effectiveDate && !Number.isNaN(new Date(d.effectiveDate).getTime())
    ? new Date(d.effectiveDate).toISOString()
    : null;

  const id = createAnnouncement({
    title: d.title,
    summary: d.summary,
    body: d.body,
    category: d.category,
    urgency: d.urgency,
    status,
    institutionId: d.institutionId || null,
    sourceName: d.sourceName,
    sourceUrl: d.sourceUrl || null,
    effectiveDate,
    editorId: guard.session.user.id
  });

  if (status === 'VERIFIED') {
    fanOutAnnouncementNotification(id, d.title, d.summary, d.institutionId || null, d.category);
  }
  logAudit({ userId: guard.session.user.id, action: 'ADMIN_CREATE_ANNOUNCEMENT', entity: 'announcement', entityId: id, detail: status, ip: getClientIp(req) });
  return ok({ ok: true, id }, 201);
}
