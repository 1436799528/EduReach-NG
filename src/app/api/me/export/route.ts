import { isGuardError, requireApiUser, serverError } from '@/lib/api';
import { getProfile } from '@/lib/data/users';
import { listBookmarks, listDeadlines, listDocuments, listTasks } from '@/lib/data/workspace';

export const dynamic = 'force-dynamic';

/** §26 Data ownership: full personal-data export as JSON. */
export async function GET(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;

  const userId = guard.session.user.id;
  try {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        email: guard.session.user.email,
        fullName: guard.session.user.full_name,
        phone: guard.session.user.phone,
        role: guard.session.user.role,
        createdAt: guard.session.user.created_at
      },
      profile: getProfile(userId) ?? null,
      documents: listDocuments(userId).map((d) => ({
        title: d.title, templateKey: d.template_key, values: JSON.parse(d.field_values || '{}'), content: d.content, createdAt: d.created_at
      })),
      deadlines: listDeadlines(userId),
      tasks: listTasks(userId),
      bookmarks: listBookmarks(userId)
    };
    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="edureach-export-${new Date().toISOString().slice(0, 10)}.json"`
      }
    });
  } catch {
    return serverError();
  }
}
