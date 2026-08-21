import { isGuardError, ok, parseJson, requireApiUser } from '@/lib/api';
import { createTask, listTasks } from '@/lib/data/workspace';
import { taskSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  return ok({ tasks: listTasks(guard.session.user.id) });
}

export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const parsed = await parseJson(req, taskSchema);
  if ('response' in parsed) return parsed.response;
  const d = parsed.data;
  const due = d.dueAt && !Number.isNaN(new Date(d.dueAt).getTime()) ? new Date(d.dueAt).toISOString() : null;
  const id = createTask(guard.session.user.id, d.title, d.description || null, due);
  return ok({ ok: true, id }, 201);
}
