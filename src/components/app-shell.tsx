import { Logo } from '@/components/public-chrome';
import { BottomNav, NotificationBell, SidebarNav, TopSearch, UserMenu } from '@/components/app-nav';
import { roleAtLeast, ROLE_LABELS, type SessionUser } from '@/lib/auth';
import { unreadCount } from '@/lib/data/workspace';

export function AppShell({ session, children }: { session: SessionUser; children: React.ReactNode }) {
  const unread = unreadCount(session.user.id);
  const isAdmin = roleAtLeast(session.user.role, 'MODERATOR');

  return (
    <div className="app-shell">
      <header className="topbar">
        <Logo href="/dashboard" />
        <TopSearch />
        <NotificationBell initialUnread={unread} />
        <UserMenu
          name={session.user.full_name}
          email={session.user.email}
          role={ROLE_LABELS[session.user.role]}
        />
      </header>
      <div className="app-body">
        <aside className="sidebar" aria-label="Workspace">
          <SidebarNav isAdmin={isAdmin} />
        </aside>
        <div className="app-main">
          <div className="container" style={{ maxWidth: 1080, padding: 0 }}>
            {children}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
