import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listTasks } from '@/lib/data/workspace';
import { TaskBoard } from '@/components/task-board';

export const metadata: Metadata = { title: 'My tasks' };
export const dynamic = 'force-dynamic';

export default function TasksPage() {
  const session = getSessionUser();
  if (!session) redirect('/login?next=/tasks');

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-head">
        <h1 style={{ fontSize: '1.8rem' }}>My tasks</h1>
        <p>The small things that cost you when you forget them — registrations, uploads, prints, payments.</p>
      </div>
      <TaskBoard initial={listTasks(session.user.id)} />
    </div>
  );
}
