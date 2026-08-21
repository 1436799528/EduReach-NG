import { z } from 'zod';
import { fail, getClientIp, isGuardError, logAudit, ok, parseJson, requireApiRole } from '@/lib/api';
import { one, run, uid } from '@/lib/db';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(4, 'Institution name is required.').max(200),
  shortName: z.string().trim().max(20).optional().or(z.literal('')),
  type: z.enum(['UNIVERSITY', 'POLYTECHNIC', 'COLLEGE_OF_EDUCATION']),
  state: z.string().trim().min(2, 'State is required.').max(60),
  city: z.string().trim().max(60).optional().or(z.literal('')),
  website: z.string().trim().url().max(500).optional().or(z.literal('')),
  admissionPortal: z.string().trim().url().max(500).optional().or(z.literal('')),
  studentPortal: z.string().trim().url().max(500).optional().or(z.literal('')),
  about: z.string().trim().max(4000).optional().or(z.literal(''))
});

function slugify(s: string): string {
  return s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function POST(req: Request) {
  const guard = requireApiRole(req, 'ADMIN');
  if (isGuardError(guard)) return guard.response;

  const parsed = await parseJson(req, schema);
  if ('response' in parsed) return parsed.response;
  const d = parsed.data;

  const slug = slugify(d.name);
  if (one('SELECT id FROM institutions WHERE slug = ?', [slug])) {
    return fail(409, 'An institution with this name already exists.');
  }

  const id = uid();
  run(
    `INSERT INTO institutions (id, slug, name, short_name, type, state, city, website, admission_portal, student_portal, about)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, slug, d.name, d.shortName || null, d.type, d.state, d.city || null, d.website || null, d.admissionPortal || null, d.studentPortal || null, d.about || null]
  );
  logAudit({ userId: guard.session.user.id, action: 'ADMIN_CREATE_INSTITUTION', entity: 'institution', entityId: id, detail: d.name, ip: getClientIp(req) });
  return ok({ ok: true, id, slug }, 201);
}
