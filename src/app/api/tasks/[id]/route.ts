import { z } from 'zod';
import { fail, isGuardError, ok, parseJson, requireApiUser } from '@/lib/api';
import { deleteTask, setTaskStatus } from '@/lib/data/workspace';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };
const patchSchema = z.object({ status: z.enum(['PENDING', 'COMPLETED']) });

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const parsed = await parseJson(req, patchSchema);
  if ('response' in parsed) return parsed.response;
  const updated = setTaskStatus(guard.session.user.id, params.id, parsed.data.status);
  if (!updated) return fail(404, 'Task not found.');
  return ok({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const deleted = deleteTask(guard.session.user.id, params.id);
  if (!deleted) return fail(404, 'Task not found.');
  return ok({ ok: true });
}
