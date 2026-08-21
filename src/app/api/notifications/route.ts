import { isGuardError, ok, requireApiUser } from '@/lib/api';
import { derivedDeadlineReminders, listNotifications, unreadCount } from '@/lib/data/workspace';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = requireApiUser(req);
  if (isGuardError(guard)) return guard.response;
  const userId = guard.session.user.id;

  const reminders = derivedDeadlineReminders(userId);
  const stored = listNotifications(userId, 20).map((n) => ({
    id: n.id, title: n.title, body: n.body, link: n.link, read: !!n.read, derived: false, created_at: n.created_at
  }));

  return ok({
    reminders,
    notifications: stored,
    // Unread badge counts both stored notifications and due reminders.
    unread: unreadCount(userId) + reminders.length
  });
}
