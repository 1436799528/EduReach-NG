import './server-only';
import { z, ZodError, type ZodTypeAny } from 'zod';
import { getSessionUser, requireRole, type Role, type SessionUser } from '@/lib/auth';
import { run, uid, nowIso } from '@/lib/db';

// ─── JSON responses ──────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export function fail(status: number, message: string, extra?: Record<string, unknown>): Response {
  return Response.json({ error: message, ...extra }, { status });
}

/** User-friendly error contract (§33): never leak internals to clients. */
export function serverError(): Response {
  return fail(500, 'Something went wrong. Please try again.');
}

// ─── Request guards ─────────────────────────────────────────────────────────

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() ?? 'unknown';
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * CSRF hardening for cookie-auth mutations: when an Origin header is present
 * it must match the request host. SameSite=Lax cookies provide the base
 * protection; this blocks cross-origin fetch/XHR posts as well.
 */
export function originAllowed(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // non-browser clients; SameSite=Lax covers browsers
  try {
    const host = req.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export interface GuardOk {
  session: SessionUser;
}
export type GuardResult = { session: SessionUser } | { response: Response };

/** Requires an authenticated ACTIVE user for an API route. */
export function requireApiUser(req: Request): GuardResult {
  if (!originAllowed(req)) return { response: fail(403, 'Forbidden.') };
  const s = getSessionUser();
  if (!s) return { response: fail(401, 'Please log in to continue.') };
  return { session: s };
}

/** Requires an authenticated user with role >= min. Enforced server-side. */
export function requireApiRole(req: Request, min: Role): GuardResult {
  if (!originAllowed(req)) return { response: fail(403, 'Forbidden.') };
  const s = requireRole(min);
  if (!s) return { response: fail(403, 'You do not have permission to do that.') };
  return { session: s };
}

export function isGuardError(r: GuardResult): r is { response: Response } {
  return 'response' in r;
}

// ─── Validation ─────────────────────────────────────────────────────────────

export async function parseJson<S extends ZodTypeAny>(req: Request, schema: S): Promise<{ data: z.output<S> } | { response: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { response: fail(400, 'Invalid request body.') };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return { response: fail(400, firstZodMessage(result.error)) };
  }
  return { data: result.data };
}

export function firstZodMessage(err: ZodError): string {
  const issue = err.issues[0];
  return issue?.message ?? 'Please check your input and try again.';
}

// ─── Rate limiting (in-memory, per-process; move to shared store at scale) ──

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  b.count += 1;
  if (b.count > limit) {
    return { allowed: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function tooMany(retryAfterSec: number): Response {
  return fail(429, 'Too many attempts. Please wait a moment and try again.', { retryAfterSec });
}

// ─── Audit + activity logs (§34) ────────────────────────────────────────────

export function logAudit(entry: {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  detail?: string;
  ip?: string;
}): void {
  try {
    run(
      'INSERT INTO audit_logs (id, user_id, action, entity, entity_id, detail, ip, created_at) VALUES (?,?,?,?,?,?,?,?)',
      [uid(), entry.userId ?? null, entry.action, entry.entity ?? null, entry.entityId ?? null, entry.detail ?? null, entry.ip ?? null, nowIso()]
    );
  } catch {
    // Logging must never break the request path.
  }
}

export function logActivity(userId: string, kind: string, summary: string): void {
  try {
    run('INSERT INTO activity_logs (id, user_id, kind, summary, created_at) VALUES (?,?,?,?,?)', [
      uid(),
      userId,
      kind,
      summary,
      nowIso()
    ]);
  } catch {
    // Non-critical.
  }
}
