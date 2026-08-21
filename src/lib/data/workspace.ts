import '@/lib/server-only';
import { all, one, run, uid, nowIso } from '@/lib/db';

// ─── Deadlines ───────────────────────────────────────────────────────────────

export interface DeadlineRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  course: string | null;
  due_at: string;
  location: string | null;
  description: string | null;
  priority: string;
  status: string;
  remind_days: number;
  created_at: string;
  updated_at: string;
}

export function listDeadlines(userId: string): DeadlineRow[] {
  return all<DeadlineRow>('SELECT * FROM deadlines WHERE user_id = ? ORDER BY due_at ASC', [userId]);
}

export function upcomingDeadlines(userId: string, withinDays: number): DeadlineRow[] {
  const now = nowIso();
  const until = new Date(Date.now() + withinDays * 24 * 3600 * 1000).toISOString();
  return all<DeadlineRow>(
    `SELECT * FROM deadlines WHERE user_id = ? AND status = 'PENDING' AND due_at BETWEEN ? AND ? ORDER BY due_at ASC`,
    [userId, now, until]
  );
}

export function createDeadline(userId: string, data: {
  type: string; title: string; course: string | null; dueAt: string; location: string | null;
  description: string | null; priority: string; remindDays: number;
}): string {
  const id = uid();
  const now = nowIso();
  run(
    `INSERT INTO deadlines (id, user_id, type, title, course, due_at, location, description, priority, status, remind_days, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, userId, data.type, data.title, data.course, data.dueAt, data.location, data.description, data.priority, 'PENDING', data.remindDays, now, now]
  );
  return id;
}

export function updateDeadline(userId: string, id: string, data: Partial<{
  type: string; title: string; course: string | null; dueAt: string; location: string | null;
  description: string | null; priority: string; status: string; remindDays: number;
}>): boolean {
  const current = one<DeadlineRow>('SELECT * FROM deadlines WHERE id = ? AND user_id = ?', [id, userId]);
  if (!current) return false;
  run(
    `UPDATE deadlines SET type=?, title=?, course=?, due_at=?, location=?, description=?, priority=?, status=?, remind_days=?, updated_at=? WHERE id=?`,
    [
      data.type ?? current.type,
      data.title ?? current.title,
      data.course !== undefined ? data.course : current.course,
      data.dueAt ?? current.due_at,
      data.location !== undefined ? data.location : current.location,
      data.description !== undefined ? data.description : current.description,
      data.priority ?? current.priority,
      data.status ?? current.status,
      data.remindDays ?? current.remind_days,
      nowIso(),
      id
    ]
  );
  return true;
}

export function deleteDeadline(userId: string, id: string): boolean {
  return run('DELETE FROM deadlines WHERE id = ? AND user_id = ?', [id, userId]) > 0;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  source: string;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export function listTasks(userId: string): TaskRow[] {
  return all<TaskRow>(
    `SELECT * FROM tasks WHERE user_id = ? ORDER BY CASE status WHEN 'PENDING' THEN 0 ELSE 1 END, created_at DESC`,
    [userId]
  );
}

export function pendingTasks(userId: string, limit = 4): TaskRow[] {
  return all<TaskRow>(`SELECT * FROM tasks WHERE user_id = ? AND status = 'PENDING' ORDER BY created_at DESC LIMIT ?`, [userId, limit]);
}

export function createTask(userId: string, title: string, description: string | null, dueAt: string | null, source = 'MANUAL'): string {
  const id = uid();
  run('INSERT INTO tasks (id, user_id, title, description, status, source, due_at, created_at) VALUES (?,?,?,?,?,?,?,?)', [
    id, userId, title, description, 'PENDING', source, dueAt, nowIso()
  ]);
  return id;
}

export function setTaskStatus(userId: string, id: string, status: 'PENDING' | 'COMPLETED'): boolean {
  return run(
    'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ? AND user_id = ?',
    [status, status === 'COMPLETED' ? nowIso() : null, id, userId]
  ) > 0;
}

export function deleteTask(userId: string, id: string): boolean {
  return run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]) > 0;
}

// ─── Generated documents ─────────────────────────────────────────────────────

export interface DocumentRow {
  id: string;
  user_id: string;
  template_key: string;
  title: string;
  field_values: string;
  content: string;
  created_at: string;
}

export function listDocuments(userId: string): DocumentRow[] {
  return all<DocumentRow>('SELECT * FROM generated_documents WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

export function findDocument(userId: string, id: string): DocumentRow | undefined {
  return one<DocumentRow>('SELECT * FROM generated_documents WHERE id = ? AND user_id = ?', [id, userId]);
}

export function createDocument(userId: string, templateKey: string, title: string, fieldValues: string, content: string): string {
  const id = uid();
  run('INSERT INTO generated_documents (id, user_id, template_key, title, field_values, content, created_at) VALUES (?,?,?,?,?,?,?)', [
    id, userId, templateKey, title, fieldValues, content, nowIso()
  ]);
  return id;
}

export function deleteDocument(userId: string, id: string): boolean {
  return run('DELETE FROM generated_documents WHERE id = ? AND user_id = ?', [id, userId]) > 0;
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export interface BookmarkRow {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  url: string;
  created_at: string;
}

export function listBookmarks(userId: string): BookmarkRow[] {
  return all<BookmarkRow>('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

export function addBookmark(userId: string, kind: string, title: string, url: string): string {
  const id = uid();
  run('INSERT INTO bookmarks (id, user_id, kind, title, url, created_at) VALUES (?,?,?,?,?,?)', [id, userId, kind, title, url, nowIso()]);
  return id;
}

export function removeBookmark(userId: string, url: string): boolean {
  return run('DELETE FROM bookmarks WHERE user_id = ? AND url = ?', [userId, url]) > 0;
}

export function isBookmarked(userId: string, url: string): boolean {
  return !!one('SELECT id FROM bookmarks WHERE user_id = ? AND url = ?', [userId, url]);
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  link: string | null;
  read: number;
  created_at: string;
}

export function listNotifications(userId: string, limit = 20): NotificationRow[] {
  return all<NotificationRow>('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]);
}

export function unreadCount(userId: string): number {
  const row = one<{ c: number }>('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0', [userId]);
  return row?.c ?? 0;
}

export function markAllRead(userId: string): void {
  run('UPDATE notifications SET read = 1 WHERE user_id = ?', [userId]);
}

export function createNotification(userId: string, title: string, body: string, link: string | null): void {
  run('INSERT INTO notifications (id, user_id, title, body, link, read, created_at) VALUES (?,?,?,?,?,0,?)', [
    uid(), userId, title, body, link, nowIso()
  ]);
}

/** Fan-out a published announcement to in-app notification inboxes (§22). */
export function fanOutAnnouncementNotification(announcementId: string, title: string, summary: string, institutionId: string | null, category: string): number {
  let recipients: { id: string }[];
  if (institutionId) {
    recipients = all<{ id: string }>(
      `SELECT DISTINCT u.id FROM users u JOIN profiles p ON p.user_id = u.id
       WHERE u.status = 'ACTIVE' AND u.notify_in_app = 1 AND p.institution_id = ? LIMIT 1000`,
      [institutionId]
    );
  } else if (category === 'JAMB' || category === 'ADMISSION') {
    recipients = all<{ id: string }>(
      `SELECT id FROM users WHERE status = 'ACTIVE' AND notify_in_app = 1 LIMIT 1000`
    );
  } else {
    return 0;
  }
  const now = nowIso();
  for (const r of recipients) {
    run('INSERT INTO notifications (id, user_id, title, body, link, read, created_at) VALUES (?,?,?,?,?,0,?)', [
      uid(), r.id, title, summary, `/check#${announcementId}`, now
    ]);
  }
  return recipients.length;
}

// ─── Activity (My Activity, §50) ─────────────────────────────────────────────

export interface ActivityRow {
  id: string;
  user_id: string;
  kind: string;
  summary: string;
  created_at: string;
}

export function listActivity(userId: string, limit = 50): ActivityRow[] {
  return all<ActivityRow>('SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]);
}

export function topActivities(kind?: string): { kind: string; c: number }[] {
  if (kind) return all('SELECT kind, COUNT(*) AS c FROM activity_logs WHERE kind = ? GROUP BY kind', [kind]);
  return all('SELECT kind, COUNT(*) AS c FROM activity_logs GROUP BY kind ORDER BY c DESC');
}
