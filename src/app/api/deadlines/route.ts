import { isGuardError, logActivity, ok, parseJson, requireApiUser } from '@/lib/api';
import { createDeadline, listDeadlines } from '@/lib/data/workspace';
import { deadlineSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  return ok({ deadlines: listDeadlines(guard.session.user.id) });
}

export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const parsed = await parseJson(req, deadlineSchema);
  if ('response' in parsed) return parsed.response;
  const d = parsed.data;

  const dueDate = new Date(d.dueAt);
  if (Number.isNaN(dueDate.getTime())) {
    return requireJsonError();
  }
  const dueIso = d.time
    ? new Date(`${d.dueAt}T${d.time}:00`).toISOString()
    : dueDate.toISOString();

  const id = createDeadline(guard.session.user.id, {
    type: d.type,
    title: d.title,
    course: d.course || null,
    dueAt: dueIso,
    location: d.location || null,
    description: d.description || null,
    priority: d.priority,
    remindDays: d.remindDays
  });
  logActivity(guard.session.user.id, 'DEADLINE_CREATED', `Added deadline "${d.title}"`);
  return ok({ ok: true, id }, 201);
}

function requireJsonError(): Response {
  return Response.json({ error: 'Please enter a valid date.' }, { status: 400 });
}
