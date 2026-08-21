import { fail, isGuardError, ok, parseJson, requireApiUser } from '@/lib/api';
import { deleteDeadline, updateDeadline } from '@/lib/data/workspace';
import { deadlinePatchSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const parsed = await parseJson(req, deadlinePatchSchema);
  if ('response' in parsed) return parsed.response;
  const d = parsed.data;

  const updated = updateDeadline(guard.session.user.id, params.id, {
    ...(d.type ? { type: d.type } : {}),
    ...(d.title ? { title: d.title } : {}),
    ...(d.course !== undefined ? { course: d.course || null } : {}),
    ...(d.dueAt ? { dueAt: new Date(d.time ? `${d.dueAt}T${d.time}:00` : d.dueAt).toISOString() } : {}),
    ...(d.location !== undefined ? { location: d.location || null } : {}),
    ...(d.description !== undefined ? { description: d.description || null } : {}),
    ...(d.priority ? { priority: d.priority } : {}),
    ...(d.status ? { status: d.status } : {}),
    ...(d.remindDays !== undefined ? { remindDays: d.remindDays } : {})
  });
  if (!updated) return fail(404, 'Item not found.');
  return ok({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const deleted = deleteDeadline(guard.session.user.id, params.id);
  if (!deleted) return fail(404, 'Item not found.');
  return ok({ ok: true });
}
