import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listVerifiedAnnouncements } from '@/lib/data/content';
import { listDocuments, listNotifications, pendingTasks, setTaskStatus, upcomingDeadlines } from '@/lib/data/workspace';
import { countdownLabel, fmtDate, timeAgo } from '@/lib/format';
import { CategoryTag, EmptyState, UrgencyBadge, VerificationBadge } from '@/components/ui';
import {
  IconCalc, IconCheck, IconClock, IconFolder, IconPen, IconQuestion, IconSearch, IconArrowRight, IconBell
} from '@/components/icons';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

const ACTIONS = [
  { href: '/write', icon: <IconPen size={20} />, cls: 'write', title: 'Write something', desc: 'Letters, appeals & requests' },
  { href: '/universities', icon: <IconSearch size={20} />, cls: 'find', title: 'Find information', desc: 'Schools, cut-offs, guides' },
  { href: '/check', icon: <IconCheck size={20} />, cls: 'check', title: 'Check updates', desc: 'JAMB & school announcements' },
  { href: '/tools/gpa-calculator', icon: <IconCalc size={20} />, cls: 'calc', title: 'Calculate', desc: 'GPA, CGPA, targets' },
  { href: '/resources', icon: <IconFolder size={20} />, cls: 'get', title: 'Get resources', desc: 'Past questions & guides' },
  { href: '/ask', icon: <IconQuestion size={20} />, cls: 'ask', title: 'Ask a question', desc: 'Curated practical answers' }
];

export default function DashboardPage() {
  const session = getSessionUser();
  if (!session) redirect('/login');

  const userId = session.user.id;
  const upcoming = upcomingDeadlines(userId, 14);
  const tasks = pendingTasks(userId, 4);
  const notices = listNotifications(userId, 3).filter((n) => !n.read);
  const updates = listVerifiedAnnouncements({ institutionId: session.profile?.institution_id ?? undefined, limit: 6 });
  const docs = listDocuments(userId).slice(0, 3);
  const firstName = session.user.full_name.split(' ')[0] ?? 'there';
  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });
  const profileIncomplete = !session.profile?.institution_id;

  const hasAttention = upcoming.length > 0 || notices.length > 0 || profileIncomplete;

  return (
    <div className="stack" style={{ gap: 24 }}>
      {/* Greeting */}
      <div className="greeting-card">
        <p className="small" style={{ color: 'rgba(255,255,255,0.75)', margin: '0 0 2px' }}>{today}</p>
        <h2>Welcome back, {firstName} 👋</h2>
        <p>
          {session.institutionName
            ? `${session.institutionName}${session.profile?.level ? ` · ${session.profile.level} level` : ''}`
            : 'Set your school to personalise this page'}
        </p>
      </div>

      {/* What do you need help with? */}
      <section>
        <h2 style={{ fontSize: '1.3rem' }}>What do you need help with?</h2>
        <div className="grid grid--3">
          {ACTIONS.map((a) => (
            <Link key={a.title} href={a.href} className="action-tile" style={{ padding: 16 }}>
              <div className="row">
                <span className={`action-tile__icon action-tile__icon--${a.cls}`} style={{ width: 36, height: 36 }}>{a.icon}</span>
                <h3 style={{ fontSize: '1rem' }}>{a.title}</h3>
              </div>
              <p className="small">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Needs your attention */}
      <section>
        <div className="row spread"><h2 style={{ fontSize: '1.3rem', margin: 0 }}>Needs your attention</h2></div>
        {hasAttention ? (
          <div className="mt-1">
            {profileIncomplete ? (
              <Link href="/onboarding" className="attention-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="attention-item__icon attention-item__icon--green"><IconArrowRight size={18} /></span>
                <span>
                  <strong>Personalise your experience</strong>
                  <div className="small muted">Tell us your school, department and level — takes 30 seconds.</div>
                </span>
              </Link>
            ) : null}
            {upcoming.slice(0, 4).map((d) => {
              const label = countdownLabel(d.due_at);
              const soon = label === 'Today' || label === 'Tomorrow';
              return (
                <Link key={d.id} href="/deadlines" className="attention-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span className={`attention-item__icon ${soon ? 'attention-item__icon--red' : ''}`}><IconClock size={18} /></span>
                  <span className="grow">
                    <strong>{d.title}</strong>
                    <div className="small muted">{d.type.replace(/_/g, ' ')}{d.course ? ` · ${d.course}` : ''} · {fmtDate(d.due_at)}</div>
                  </span>
                  <span className={`countdown ${soon ? 'countdown--today' : 'countdown--soon'}`}>{label}</span>
                </Link>
              );
            })}
            {notices.map((n) => (
              <Link key={n.id} href={n.link ?? '/check'} className="attention-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="attention-item__icon"><IconBell size={18} /></span>
                <span>
                  <strong>{n.title}</strong>
                  <div className="small muted">{n.body.slice(0, 100)}{n.body.length > 100 ? '…' : ''} · {timeAgo(n.created_at)}</div>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card mt-1">
            <EmptyState title="You're on top of things" body="No urgent deadlines, no unread updates. Add a deadline or check the latest news below." />
          </div>
        )}
      </section>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', alignItems: 'start' }}>
        {/* Quick tools */}
        <section className="card">
          <div className="card__title"><h3>Quick tools</h3></div>
          <div className="stack" style={{ gap: 8 }}>
            {[
              ['GPA Calculator', '/tools/gpa-calculator', 'Semester grade point average'],
              ['CGPA Target — "Can I still get it?"', '/tools/cgpa-target', 'Check if your target is possible'],
              ['Letter Generator', '/write', 'Official letters in minutes'],
              ['Exam Countdown', '/deadlines', 'Track tests, exams, fees']
            ].map(([label, href, hint]) => (
              <Link key={label} href={href!} className="row attention-item" style={{ textDecoration: 'none', color: 'inherit', padding: 10 }}>
                <span className="attention-item__icon attention-item__icon--green"><IconCalc size={16} /></span>
                <span>
                  <strong style={{ fontSize: '0.95rem' }}>{label}</strong>
                  <div className="small muted">{hint}</div>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Tasks */}
        <section className="card">
          <div className="card__title">
            <h3>Your tasks</h3>
            <Link href="/tasks" className="btn btn--ghost btn--sm">Manage</Link>
          </div>
          {tasks.length === 0 ? (
            <EmptyState title="No pending tasks" body="Add things like 'Complete course registration' so they stop living in your head." />
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {tasks.map((t) => (
                <li key={t.id} className="row" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="grow">{t.title}</span>
                  {t.due_at ? <span className="countdown">{countdownLabel(t.due_at)}</span> : null}
                </li>
              ))}
            </ul>
          )}
          {docs.length > 0 ? (
            <>
              <div className="divider-label">Recent documents</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {docs.map((d) => (
                  <li key={d.id} className="row" style={{ padding: '6px 0' }}>
                    <Link href="/me/documents" className="grow" style={{ fontSize: '0.92rem' }}>{d.title}</Link>
                    <span className="small muted">{timeAgo(d.created_at)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </div>

      {/* Latest verified updates */}
      <section>
        <div className="row spread">
          <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Latest verified updates</h2>
          <Link href="/check" className="btn btn--ghost btn--sm">View all</Link>
        </div>
        {updates.length === 0 ? (
          <div className="card mt-1"><EmptyState title="No updates yet" body="Verified announcements for your school will appear here." /></div>
        ) : (
          <div className="grid grid--2 mt-1">
            {updates.map((a) => (
              <article key={a.id} className="card card--hover update-card" id={a.id}>
                <div className="row row--wrap" style={{ gap: 8 }}>
                  <CategoryTag label={a.category} />
                  <UrgencyBadge urgency={a.urgency} />
                  <VerificationBadge status={a.status} />
                </div>
                <h4>{a.title}</h4>
                <p className="small muted" style={{ margin: 0 }}>{a.summary}</p>
                <div className="update-card__source">
                  {a.institution_name ?? 'National'} · Source: {a.source_name} · Published {fmtDate(a.published_at)}
                  {a.updated_at !== a.published_at ? ` · Updated ${fmtDate(a.updated_at)}` : ''}
                  {' '}· Last verified {fmtDate(a.last_verified_at)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
