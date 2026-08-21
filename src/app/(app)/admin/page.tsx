import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser, roleAtLeast } from '@/lib/auth';
import { listAuditLogs, countUsers } from '@/lib/data/users';
import { all } from '@/lib/db';
import { topActivities } from '@/lib/data/workspace';
import { StatCard } from '@/components/ui';
import { fmtDate, timeAgo } from '@/lib/format';

export const metadata: Metadata = { title: 'Admin overview' };
export const dynamic = 'force-dynamic';

export default function AdminOverviewPage() {
  const session = getSessionUser();
  if (!session || !roleAtLeast(session.user.role, 'MODERATOR')) redirect('/dashboard');

  const totalUsers = countUsers();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const newUsers = countUsers({ sinceIso: weekAgo });

  const annStats = all<{ status: string; c: number }>('SELECT status, COUNT(*) AS c FROM announcements GROUP BY status');
  const byStatus = Object.fromEntries(annStats.map((s) => [s.status, s.c]));
  const pendingCutoffs = all<{ c: number }>("SELECT COUNT(*) AS c FROM cutoff_marks WHERE status IN ('PENDING','UNDER_REVIEW')")[0]?.c ?? 0;
  const pendingResources = all<{ c: number }>("SELECT COUNT(*) AS c FROM resources WHERE status = 'PENDING'")[0]?.c ?? 0;
  const openReports = all<{ c: number }>("SELECT COUNT(*) AS c FROM resource_reports WHERE status = 'OPEN'")[0]?.c ?? 0;
  const docCount = all<{ c: number }>('SELECT COUNT(*) AS c FROM generated_documents')[0]?.c ?? 0;
  const deadlineCount = all<{ c: number }>('SELECT COUNT(*) AS c FROM deadlines')[0]?.c ?? 0;
  const pendingVerification = (byStatus['PENDING'] ?? 0) + (byStatus['UNDER_REVIEW'] ?? 0) + pendingCutoffs + pendingResources;

  const topTools = topActivities();
  const audits = listAuditLogs(30);

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="grid grid--4">
        <StatCard label="Registered users" value={totalUsers} hint={`+${newUsers} this week`} />
        <StatCard label="Pending verification" value={pendingVerification} hint="announcements, cut-offs, resources" />
        <StatCard label="Letters generated" value={docCount} />
        <StatCard label="Deadlines tracked" value={deadlineCount} hint={`${openReports} open reports`} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', alignItems: 'start' }}>
        <section className="card">
          <div className="card__title"><h3>Announcements by status</h3></div>
          {annStats.length === 0 ? <p className="small muted">No announcements yet.</p> : (
            <table className="table">
              <tbody>
                {annStats.map((s) => (
                  <tr key={s.status}><td>{s.status}</td><td className="text-right"><strong>{s.c}</strong></td></tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="divider-label">Product usage (events)</div>
          {topTools.length === 0 ? <p className="small muted">No activity yet.</p> : (
            <table className="table">
              <tbody>
                {topTools.map((t) => (
                  <tr key={t.kind}><td>{t.kind.replace(/_/g, ' ')}</td><td className="text-right"><strong>{t.c}</strong></td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <div className="card__title"><h3>Recent audit log</h3></div>
          {audits.length === 0 ? <p className="small muted">Nothing logged yet.</p> : (
            audits.map((a) => (
              <div key={a.id} style={{ padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
                <div className="row spread">
                  <strong style={{ fontSize: '0.85rem' }}>{a.action.replace(/_/g, ' ')}</strong>
                  <span className="small muted">{timeAgo(a.created_at)}</span>
                </div>
                <span className="small muted">
                  {a.entity ? `${a.entity}${a.entity_id ? ` · ${a.entity_id.slice(0, 8)}…` : ''}` : ''}
                  {a.ip ? ` · ip ${a.ip}` : ''} · {fmtDate(a.created_at)}
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
