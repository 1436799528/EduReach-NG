import { z } from 'zod';
import { fail, getClientIp, isGuardError, logAudit, ok, parseJson, requireApiRole } from '@/lib/api';
import { one, run, uid } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

const schema = z.object({ name: z.string().trim().min(3, 'Faculty name is required.').max(200) });

export async function POST(req: Request, { params }: Ctx) {
  const guard = requireApiRole(req, 'ADMIN');
  if (isGuardError(guard)) return guard.response;

  const institution = one<{ id: string }>('SELECT id FROM institutions WHERE id = ?', [params.id]);
  if (!institution) return fail(404, 'Institution not found.');

  const parsed = await parseJson(req, schema);
  if ('response' in parsed) return parsed.response;
  const name = parsed.data.name;
  const slug = name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (one('SELECT id FROM faculties WHERE institution_id = ? AND slug = ?', [params.id, slug])) {
    return fail(409, 'That faculty already exists for this institution.');
  }

  const id = uid();
  run('INSERT INTO faculties (id, institution_id, name, slug) VALUES (?,?,?,?)', [id, params.id, name, slug]);
  logAudit({ userId: guard.session.user.id, action: 'ADMIN_CREATE_FACULTY', entity: 'faculty', entityId: id, detail: name, ip: getClientIp(req) });
  return ok({ ok: true, id }, 201);
}
