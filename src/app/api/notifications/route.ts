import { isGuardError, ok, requireApiUser } from '@/lib/api';
import { listNotifications, unreadCount } from '@/lib/data/workspace';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const userId = guard.session.user.id;
  return ok({
    notifications: listNotifications(userId, 20).map((n) => ({
      id: n.id, title: n.title, body: n.body, link: n.link, read: !!n.read, created_at: n.created_at
    })),
    unread: unreadCount(userId)
  });
}
