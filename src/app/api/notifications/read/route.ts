import { isGuardError, ok, requireApiUser } from '@/lib/api';
import { markAllRead } from '@/lib/data/workspace';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  markAllRead(guard.session.user.id);
  return ok({ ok: true });
}
