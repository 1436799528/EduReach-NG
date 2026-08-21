import '@/lib/server-only';
import { all, one, run, uid, nowIso } from '@/lib/db';
import type { ProfileRow, UserRow } from '@/lib/auth';

export function createUser(data: {
  email: string; passwordHash: string; fullName: string; phone?: string | null; role?: string;
}): string {
  const id = uid();
  const now = nowIso();
  run(
    'INSERT INTO users (id, email, password_hash, full_name, phone, role, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, data.email.toLowerCase(), data.passwordHash, data.fullName, data.phone ?? null, data.role ?? 'STUDENT', 'ACTIVE', now, now]
  );
  run('INSERT INTO profiles (id, user_id) VALUES (?,?)', [uid(), id]);
  return id;
}

export function getProfile(userId: string): ProfileRow | undefined {
  return one<ProfileRow>('SELECT * FROM profiles WHERE user_id = ?', [userId]);
}

export function upsertProfile(userId: string, data: {
  institutionId?: string | null; facultyId?: string | null; departmentId?: string | null;
  level?: string | null; programme?: string | null; semester?: string | null;
  currentCgpa?: number | null; studentStatus?: string | null; phone?: string | null;
}): void {
  const existing = getProfile(userId);
  if (!existing) {
    run('INSERT INTO profiles (id, user_id) VALUES (?,?)', [uid(), userId]);
  }
  run(
    `UPDATE profiles SET institution_id = COALESCE(?, institution_id), faculty_id = COALESCE(?, faculty_id),
       department_id = COALESCE(?, department_id), level = COALESCE(?, level), programme = COALESCE(?, programme),
       semester = COALESCE(?, semester), current_cgpa = COALESCE(?, current_cgpa), student_status = COALESCE(?, student_status)
     WHERE user_id = ?`,
    [
      data.institutionId ?? null, data.facultyId ?? null, data.departmentId ?? null,
      data.level ?? null, data.programme ?? null, data.semester ?? null,
      data.currentCgpa ?? null, data.studentStatus ?? null,
      userId
    ]
  );
  if (data.phone !== undefined && data.phone !== null) {
    run('UPDATE users SET phone = ?, updated_at = ? WHERE id = ?', [data.phone, nowIso(), userId]);
  }
  run('UPDATE users SET updated_at = ? WHERE id = ?', [nowIso(), userId]);
}

/** Explicit overwrite (settings form sends empty strings to clear fields). */
export function saveProfile(userId: string, data: {
  institutionId: string | null; facultyId: string | null; departmentId: string | null;
  level: string | null; programme: string | null; semester: string | null;
  currentCgpa: number | null; studentStatus: string | null; phone: string | null;
}): void {
  const existing = getProfile(userId);
  if (!existing) run('INSERT INTO profiles (id, user_id) VALUES (?,?)', [uid(), userId]);
  run(
    `UPDATE profiles SET institution_id=?, faculty_id=?, department_id=?, level=?, programme=?, semester=?, current_cgpa=?, student_status=? WHERE user_id=?`,
    [data.institutionId, data.facultyId, data.departmentId, data.level, data.programme, data.semester, data.currentCgpa, data.studentStatus, userId]
  );
  run('UPDATE users SET phone = ?, updated_at = ? WHERE id = ?', [data.phone, nowIso(), userId]);
}

export function updatePassword(userId: string, passwordHash: string): void {
  run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [passwordHash, nowIso(), userId]);
}

export function markEmailVerified(userId: string): void {
  run('UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?', [nowIso(), nowIso(), userId]);
}

export function setUserRole(userId: string, role: string): void {
  run('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [role, nowIso(), userId]);
}

export function setUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): void {
  run('UPDATE users SET status = ?, updated_at = ? WHERE id = ?', [status, nowIso(), userId]);
}

export function setNotificationPrefs(userId: string, email: boolean, inApp: boolean): void {
  run('UPDATE users SET notify_email = ?, notify_in_app = ?, updated_at = ? WHERE id = ?', [
    email ? 1 : 0, inApp ? 1 : 0, nowIso(), userId
  ]);
}

/** GDPR-style deletion: strip PII, keep referential/audit integrity. */
export function anonymizeUser(userId: string): void {
  const tombstone = `deleted-${userId.slice(0, 8)}@deleted.local`;
  run(
    `UPDATE users SET email = ?, full_name = 'Deleted user', phone = NULL, status = 'DELETED', updated_at = ? WHERE id = ?`,
    [tombstone, nowIso(), userId]
  );
  run(
    `UPDATE profiles SET institution_id = NULL, faculty_id = NULL, department_id = NULL, level = NULL,
       programme = NULL, semester = NULL, current_cgpa = NULL, student_status = NULL WHERE user_id = ?`,
    [userId]
  );
}

export function countUsers(opts: { sinceIso?: string } = {}): number {
  if (opts.sinceIso) {
    return one<{ c: number }>("SELECT COUNT(*) AS c FROM users WHERE status != 'DELETED' AND created_at >= ?", [opts.sinceIso])?.c ?? 0;
  }
  return one<{ c: number }>("SELECT COUNT(*) AS c FROM users WHERE status != 'DELETED'")?.c ?? 0;
}

export function listAuditLogs(limit = 40): { id: string; user_id: string | null; action: string; entity: string | null; entity_id: string | null; detail: string | null; ip: string | null; created_at: string }[] {
  return all('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?', [limit]);
}
