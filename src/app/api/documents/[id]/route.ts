import { fail, isGuardError, ok, requireApiUser } from '@/lib/api';
import { deleteDocument, findDocument } from '@/lib/data/workspace';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function GET(req: Request, { params }: Ctx) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const doc = findDocument(guard.session.user.id, params.id);
  if (!doc) return fail(404, 'Document not found.');
  return ok({ document: doc });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const deleted = deleteDocument(guard.session.user.id, params.id);
  if (!deleted) return fail(404, 'Document not found.');
  return ok({ ok: true });
}
