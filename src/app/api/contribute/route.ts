import { z } from 'zod';
import { getClientIp, isGuardError, logAudit, ok, parseJson, rateLimit, requireApiUser, tooMany } from '@/lib/api';
import { createAnnouncement } from '@/lib/data/content';
import { roleAtLeast } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const contributeSchema = z.object({
  title: z.string().trim().min(6, 'Give it a clear title.').max(300),
  summary: z.string().trim().min(10, 'Summarise the update in one or two sentences.').max(500),
  body: z.string().trim().max(20000).optional().or(z.literal('')),
  category: z.enum(['JAMB', 'ADMISSION', 'REGISTRATION', 'EXAMINATIONS', 'FEES', 'SIWES', 'RESULTS', 'OPPORTUNITY', 'GENERAL']),
  institutionId: z.string().trim().max(64).optional().or(z.literal('')),
  sourceName: z.string().trim().max(200).optional().or(z.literal('')),
  sourceUrl: z.string().trim().url('Source URL must be a valid URL (https://…).').max(500).optional().or(z.literal(''))
});

/**
 * Community/contributor submissions (§2 secondary users, §45 workflow).
 * Everything lands in the verification queue as PENDING — nothing from the
 * community is ever published directly.
 */
export async function POST(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const { session } = guard;

  const rl = rateLimit(`contribute:${session.user.id}`, 6, 60 * 60 * 1000);
  if (!rl.allowed) return tooMany(rl.retryAfterSec);

  const parsed = await parseJson(req, contributeSchema);
  if ('response' in parsed) return parsed.response;
  const d = parsed.data;

  const isContributor = roleAtLeast(session.user.role, 'CONTRIBUTOR');
  const sourceName = d.sourceName?.trim()
    ? d.sourceName.trim()
    : `${isContributor ? 'Contributor' : 'Community'} report — ${session.user.full_name}`;

  const id = createAnnouncement({
    title: d.title,
    summary: d.summary,
    body: d.body?.trim() || d.summary,
    category: d.category,
    urgency: 'GENERAL',
    status: 'PENDING',
    institutionId: d.institutionId || null,
    sourceName,
    sourceUrl: d.sourceUrl || null,
    effectiveDate: null,
    editorId: '' // unassigned until an editor picks it up
  });

  logAudit({ userId: session.user.id, action: 'COMMUNITY_SUBMITTED', entity: 'announcement', entityId: id, ip: getClientIp(req) });
  return ok({ ok: true, id, message: 'Submitted — an editor will verify it before anything is published.' }, 201);
}
