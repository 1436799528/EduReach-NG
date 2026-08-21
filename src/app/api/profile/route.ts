import { isGuardError, logActivity, ok, parseJson, requireApiUser } from '@/lib/api';
import { saveProfile } from '@/lib/data/users';
import { profileSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const parsed = await parseJson(req, profileSchema);
  if ('response' in parsed) return parsed.response;
  const d = parsed.data;

  saveProfile(guard.session.user.id, {
    institutionId: d.institutionId || null,
    facultyId: d.facultyId || null,
    departmentId: d.departmentId || null,
    level: d.level || null,
    programme: d.programme || null,
    semester: d.semester || null,
    currentCgpa: d.currentCgpa ?? null,
    studentStatus: d.studentStatus || null,
    phone: d.phone || null
  });

  logActivity(guard.session.user.id, 'PROFILE_UPDATED', 'Updated their academic profile');
  return ok({ ok: true });
}
