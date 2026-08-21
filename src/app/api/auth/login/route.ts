import { createSession, findUserByEmail, getSessionUser, verifyPassword } from '@/lib/auth';
import { fail, getClientIp, logAudit, ok, parseJson, rateLimit, tooMany } from '@/lib/api';
import { loginSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Already logged in? Treat as success with a redirect target.
  const existing = getSessionUser();
  if (existing) return ok({ ok: true, next: '/dashboard' });

  const ip = getClientIp(req);
  const rl = rateLimit(`login:${ip}`, 15, 10 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const parsed = await parseJson(req, loginSchema);
  if ('response' in parsed) return parsed.response;
  const { email, password } = parsed.data;

  const user = findUserByEmail(email);
  const valid = user ? await verifyPassword(password, user.password_hash) : false;

  if (!user || !valid) {
    logAudit({ action: 'AUTH_LOGIN_FAILED', ip }); // no credentials/emails in logs (§34)
    return fail(401, 'Incorrect email or password.');
  }
  if (user.status === 'SUSPENDED') {
    return fail(403, 'This account has been suspended. Contact support if you believe this is a mistake.');
  }
  if (user.status !== 'ACTIVE') {
    return fail(401, 'Incorrect email or password.');
  }

  createSession(user.id, { ip, userAgent: req.headers.get('user-agent') ?? undefined });
  logAudit({ userId: user.id, action: 'AUTH_LOGIN', ip });
  return ok({ ok: true, next: '/dashboard' });
}
