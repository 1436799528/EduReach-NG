import { isGuardError, ok, parseJson, requireApiUser } from '@/lib/api';
import { addBookmark, removeBookmark } from '@/lib/data/workspace';
import { bookmarkSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const parsed = await parseJson(req, bookmarkSchema);
  if ('response' in parsed) return parsed.response;
  const id = addBookmark(guard.session.user.id, parsed.data.kind, parsed.data.title, parsed.data.url);
  return ok({ ok: true, id }, 201);
}

export async function DELETE(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  let url = '';
  try { url = String((await req.json())?.url ?? ''); } catch { /* empty body */ }
  if (!url) return ok({ ok: true });
  removeBookmark(guard.session.user.id, url);
  return ok({ ok: true });
}
