import { createUser } from '@/lib/data/users';
import { createEmailToken, createSession, findUserByEmail, hashPassword } from '@/lib/auth';
import { fail, getClientIp, logActivity, logAudit, ok, parseJson, rateLimit, tooMany } from '@/lib/api';
import { registerSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`register:${ip}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const parsed = await parseJson(req, registerSchema);
  if ('response' in parsed) return parsed.response;
  const { fullName, email, password, phone } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  if (findUserByEmail(normalizedEmail)) {
    // Deliberately explicit (not an enumeration vector — registration inherently reveals existence).
    return fail(409, 'An account with this email already exists. Try logging in instead.');
  }

  const passwordHash = await hashPassword(password);
  const userId = createUser({ email: normalizedEmail, passwordHash, fullName, phone: phone || null });
  createSession(userId, { ip, userAgent: req.headers.get('user-agent') ?? undefined });

  const verifyToken = createEmailToken(userId, 'VERIFY_EMAIL', 24 * 60);
  logActivity(userId, 'ACCOUNT_CREATED', 'Created an EduReach account');
  logAudit({ userId, action: 'AUTH_REGISTER', ip });

  return ok({
    ok: true,
    next: '/onboarding',
    // Shown only in development — production sends this link by email (§8).
    ...(process.env.NODE_ENV !== 'production'
      ? { devVerifyUrl: `/verify-email?token=${verifyToken}` }
      : {})
  }, 201);
}
