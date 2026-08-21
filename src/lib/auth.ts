import './server-only';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { all, one, run, uid, nowIso, sha256, randomToken } from '@/lib/db';

// ─── Roles (server-enforced; frontend role checks are UX-only) ───────────────

export type Role = 'STUDENT' | 'CONTRIBUTOR' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

const ROLE_RANK: Record<Role, number> = {
  STUDENT: 1,
  CONTRIBUTOR: 2,
  MODERATOR: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5
};

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Student',
  CONTRIBUTOR: 'Contributor',
  MODERATOR: 'Moderator',
  ADMIN: 'Administrator',
  SUPER_ADMIN: 'Super administrator'
};

export function roleAtLeast(role: string, min: Role): boolean {
  return (ROLE_RANK[role as Role] ?? 0) >= ROLE_RANK[min];
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  email_verified_at: string | null;
  notify_email: number;
  notify_in_app: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  user_id: string;
  institution_id: string | null;
  faculty_id: string | null;
  department_id: string | null;
  level: string | null;
  programme: string | null;
  semester: string | null;
  current_cgpa: number | null;
  student_status: string | null;
}

export interface SessionUser {
  user: UserRow;
  profile: ProfileRow | null;
  institutionName: string | null;
  institutionSlug: string | null;
}

// ─── Passwords ───────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Sessions (opaque token, SHA-256 hash stored server-side) ────────────────

export const SESSION_COOKIE = 'er_session';
const SESSION_DAYS = 30;

export function createSession(userId: string, meta: { ip?: string; userAgent?: string }): string {
  const token = randomToken(32);
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000).toISOString();
  run(
    'INSERT INTO sessions (id, user_id, token_hash, ip, user_agent, expires_at, created_at) VALUES (?,?,?,?,?,?,?)',
    [uid(), userId, sha256(token), meta.ip ?? null, meta.userAgent ?? null, expires, nowIso()]
  );
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expires)
  });
  return token;
}

export function destroySession(): void {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) run('DELETE FROM sessions WHERE token_hash = ?', [sha256(token)]);
  cookies().delete(SESSION_COOKIE);
}

export function destroyAllUserSessions(userId: string): void {
  run('DELETE FROM sessions WHERE user_id = ?', [userId]);
}

/** Returns the authenticated user (with profile) or null. Status must be ACTIVE. */
export function getSessionUser(): SessionUser | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = one<{ user_id: string; expires_at: string }>(
    'SELECT user_id, expires_at FROM sessions WHERE token_hash = ?',
    [sha256(token)]
  );
  if (!session) return null;
  if (session.expires_at < nowIso()) {
    run('DELETE FROM sessions WHERE token_hash = ?', [sha256(token)]);
    return null;
  }

  const user = one<UserRow>('SELECT * FROM users WHERE id = ?', [session.user_id]);
  if (!user || user.status !== 'ACTIVE') return null;

  const profile = one<ProfileRow>('SELECT * FROM profiles WHERE user_id = ?', [user.id]) ?? null;
  let institutionName: string | null = null;
  let institutionSlug: string | null = null;
  if (profile?.institution_id) {
    const inst = one<{ name: string; slug: string }>(
      'SELECT name, slug FROM institutions WHERE id = ?',
      [profile.institution_id]
    );
    institutionName = inst?.name ?? null;
    institutionSlug = inst?.slug ?? null;
  }

  return { user, profile, institutionName, institutionSlug };
}

/** Page guard helper: throws-null pattern resolved by callers via redirect(). */
export function requireUser(): SessionUser | null {
  return getSessionUser();
}

/** API guard: returns SessionUser with role >= min, else null. */
export function requireRole(min: Role): SessionUser | null {
  const s = getSessionUser();
  if (!s) return null;
  if (!roleAtLeast(s.user.role, min)) return null;
  return s;
}

// ─── Email tokens (verification / password reset) ────────────────────────────

const TOKEN_PURPOSES = { VERIFY_EMAIL: 'VERIFY_EMAIL', PASSWORD_RESET: 'PASSWORD_RESET' } as const;
export type TokenPurpose = keyof typeof TOKEN_PURPOSES;

export function createEmailToken(userId: string, purpose: TokenPurpose, ttlMinutes = 60): string {
  const token = randomToken(24);
  // Invalidate previous unused tokens of the same purpose
  run('UPDATE email_tokens SET used_at = ? WHERE user_id = ? AND purpose = ? AND used_at IS NULL', [
    nowIso(),
    userId,
    purpose
  ]);
  run(
    'INSERT INTO email_tokens (id, user_id, token_hash, purpose, expires_at, created_at) VALUES (?,?,?,?,?,?)',
    [uid(), userId, sha256(token), purpose, new Date(Date.now() + ttlMinutes * 60000).toISOString(), nowIso()]
  );
  return token;
}

/** Consumes a password-reset/verification token. Returns userId or null. */
export function consumeEmailToken(token: string, purpose: TokenPurpose): string | null {
  const hash = sha256(token);
  const row = one<{ id: string; user_id: string; expires_at: string; used_at: string | null }>(
    'SELECT id, user_id, expires_at, used_at FROM email_tokens WHERE token_hash = ? AND purpose = ?',
    [hash, purpose]
  );
  if (!row || row.used_at || row.expires_at < nowIso()) return null;
  run('UPDATE email_tokens SET used_at = ? WHERE id = ?', [nowIso(), row.id]);
  return row.user_id;
}

// ─── User lookups ────────────────────────────────────────────────────────────

export function findUserByEmail(email: string): UserRow | undefined {
  return one<UserRow>('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
}

export function listUsers(): UserRow[] {
  return all<UserRow>('SELECT * FROM users ORDER BY created_at DESC');
}
