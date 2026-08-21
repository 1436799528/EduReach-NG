import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listDeadlines } from '@/lib/data/workspace';
import { DeadlineBoard } from '@/components/deadline-board';

export const metadata: Metadata = { title: 'Exam & deadline tracker' };
export const dynamic = 'force-dynamic';

export default function DeadlinesPage() {
  const session = getSessionUser();
  if (!session) redirect('/login?next=/deadlines');

  const items = listDeadlines(session.user.id);

  return (
    <div>
      <div className="page-head">
        <h1 style={{ fontSize: '1.8rem' }}>Exams &amp; deadlines</h1>
        <p>Track examinations, tests, assignments, registrations and fees — with countdowns that keep the important things loud.</p>
      </div>
      <DeadlineBoard initial={items} />
    </div>
  );
}
