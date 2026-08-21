import { z } from 'zod';
import { fail, getClientIp, isGuardError, logAudit, ok, parseJson, requireApiRole } from '@/lib/api';
import { deleteAnnouncement, findAnnouncement, setAnnouncementStatus, updateAnnouncement } from '@/lib/data/content';
import { fanOutAnnouncementNotification } from '@/lib/data/workspace';
import { announcementSchema, VERIFICATION_STATUSES } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

const patchSchema = announcementSchema.partial();

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = requireApiRole(req, 'ADMIN');
  if (isGuardError(guard)) return guard.response;

  const current = findAnnouncement(params.id);
  if (!current) return fail(404, 'Announcement not found.');

  const parsed = await parseJson(req, patchSchema);
  if ('response' in parsed) return parsed.response;
  const d = parsed.data;

  updateAnnouncement(params.id, {
    ...(d.title ? { title: d.title } : {}),
    ...(d.summary ? { summary: d.summary } : {}),
    ...(d.body ? { body: d.body } : {}),
    ...(d.category ? { category: d.category } : {}),
    ...(d.urgency ? { urgency: d.urgency } : {}),
    ...(d.institutionId !== undefined ? { institutionId: d.institutionId || null } : {}),
    ...(d.sourceName ? { sourceName: d.sourceName } : {}),
    ...(d.sourceUrl !== undefined ? { sourceUrl: d.sourceUrl || null } : {}),
    ...(d.effectiveDate !== undefined
      ? { effectiveDate: d.effectiveDate && !Number.isNaN(new Date(d.effectiveDate).getTime()) ? new Date(d.effectiveDate).toISOString() : null }
      : {})
  });

  if (d.status && (VERIFICATION_STATUSES as readonly string[]).includes(d.status)) {
    const becameVerified = d.status === 'VERIFIED' && current.status !== 'VERIFIED';
    setAnnouncementStatus(params.id, d.status, guard.session.user.id);
    if (becameVerified) {
      fanOutAnnouncementNotification(params.id, d.title ?? current.title, d.summary ?? current.summary, current.institution_id, d.category ?? current.category);
    }
    logAudit({ userId: guard.session.user.id, action: 'ADMIN_VERIFY_ANNOUNCEMENT', entity: 'announcement', entityId: params.id, detail: d.status, ip: getClientIp(req) });
  }

  return ok({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const guard = requireApiRole(req, 'ADMIN');
  if (isGuardError(guard)) return guard.response;
  const current = findAnnouncement(params.id);
  if (!current) return fail(404, 'Announcement not found.');
  deleteAnnouncement(params.id);
  logAudit({ userId: guard.session.user.id, action: 'ADMIN_DELETE_ANNOUNCEMENT', entity: 'announcement', entityId: params.id, ip: getClientIp(req) });
  return ok({ ok: true });
}
