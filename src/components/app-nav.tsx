'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  IconActivity, IconBell, IconCalc, IconCheck, IconCalendar, IconDoc, IconFolder, IconHome,
  IconPen, IconQuestion, IconSchool, IconSearch, IconSettings, IconShield, IconTasks, IconUser
} from '@/components/icons';
import { initials } from '@/lib/format';

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
      {icon}{label}
    </Link>
  );
}

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  const starts = (p: string) => path === p || path.startsWith(p + '/');
  return (
    <>
      <div className="sidebar__group">
        <div className="sidebar__label">Workspace</div>
        <NavLink href="/dashboard" icon={<IconHome size={18} />} label="Dashboard" active={path === '/dashboard'} />
        <NavLink href="/write" icon={<IconPen size={18} />} label="Write" active={starts('/write')} />
        <NavLink href="/universities" icon={<IconSearch size={18} />} label="Find" active={starts('/universities') || starts('/jamb') || starts('/admission')} />
        <NavLink href="/check" icon={<IconCheck size={18} />} label="Check" active={starts('/check')} />
        <NavLink href="/tools" icon={<IconCalc size={18} />} label="Calculate" active={starts('/tools')} />
        <NavLink href="/resources" icon={<IconFolder size={18} />} label="Get" active={starts('/resources')} />
        <NavLink href="/ask" icon={<IconQuestion size={18} />} label="Ask" active={starts('/ask')} />
      </div>
      <div className="sidebar__group">
        <div className="sidebar__label">Your space</div>
        <NavLink href="/me/school" icon={<IconSchool size={18} />} label="My School" active={starts('/me/school')} />
        <NavLink href="/me/documents" icon={<IconDoc size={18} />} label="My Documents" active={starts('/me/documents')} />
        <NavLink href="/deadlines" icon={<IconCalendar size={18} />} label="Deadlines" active={starts('/deadlines')} />
        <NavLink href="/tasks" icon={<IconTasks size={18} />} label="Tasks" active={starts('/tasks')} />
        <NavLink href="/me/activity" icon={<IconActivity size={18} />} label="My Activity" active={starts('/me/activity')} />
        <NavLink href="/me/settings" icon={<IconSettings size={18} />} label="Settings" active={starts('/me/settings')} />
      </div>
      {isAdmin ? (
        <div className="sidebar__group">
          <div className="sidebar__label">Administration</div>
          <NavLink href="/admin" icon={<IconShield size={18} />} label="Admin" active={starts('/admin')} />
        </div>
      ) : null}
    </>
  );
}

const BOTTOM = [
  { href: '/dashboard', label: 'Home', icon: <IconHome size={20} /> },
  { href: '/write', label: 'Write', icon: <IconPen size={20} /> },
  { href: '/search', label: 'Search', icon: <IconSearch size={20} /> },
  { href: '/tools', label: 'Calc', icon: <IconCalc size={20} /> },
  { href: '/check', label: 'Check', icon: <IconCheck size={20} /> },
  { href: '/ask', label: 'Ask', icon: <IconQuestion size={20} /> }
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {BOTTOM.map((b) => (
        <Link key={b.href} href={b.href} className={path === b.href || path.startsWith(b.href + '/') ? 'active' : ''}>
          {b.icon}
          {b.label}
        </Link>
      ))}
    </nav>
  );
}

export function TopSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  return (
    <form
      className="topbar__search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <span className="icon"><IconSearch size={17} /></span>
      <input
        className="input"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search schools, letters, updates, tools…"
        aria-label="Search EduReach"
      />
    </form>
  );
}

interface NotificationItem {
  id: string; title: string; body: string; link: string | null; created_at: string;
}

export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  async function load() {
    const res = await fetch('/api/notifications');
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications);
    setUnread(data.unread);
  }

  async function markRead() {
    await fetch('/api/notifications/read', { method: 'POST' });
    setUnread(0);
  }

  return (
    <div className="menu" ref={ref}>
      <button
        className="icon-btn"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
      >
        <IconBell size={20} />
        {unread > 0 ? <span className="dot">{unread > 9 ? '9+' : unread}</span> : null}
      </button>
      {open ? (
        <div className="menu__panel" style={{ width: 340 }}>
          <div className="row spread mb-1" style={{ padding: '4px 8px' }}>
            <strong>Notifications</strong>
            {unread > 0 ? (
              <button className="btn btn--ghost btn--sm" onClick={markRead}>Mark all read</button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <p className="small muted" style={{ padding: '8px 12px' }}>You&apos;re all caught up.</p>
          ) : (
            items.slice(0, 12).map((n) => (
              <Link key={n.id} href={n.link ?? '/check'} className="menu__item" onClick={markRead}>
                <span style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '0.88rem' }}>{n.title}</strong>
                  <span className="small muted">{n.body.slice(0, 90)}{n.body.length > 90 ? '…' : ''}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export function UserMenu({ name, email, role }: { name: string; email: string; role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <div className="menu" ref={ref}>
      <button className="avatar" onClick={() => setOpen((o) => !o)} aria-label="Account menu" aria-expanded={open}>
        {initials(name)}
      </button>
      {open ? (
        <div className="menu__panel">
          <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--line)', marginBottom: 6 }}>
            <strong style={{ display: 'block' }}>{name}</strong>
            <span className="small muted">{email}</span>
            <div className="mt-1"><span className="badge badge--role">{role.replace(/_/g, ' ')}</span></div>
          </div>
          <Link href="/me/school" className="menu__item" onClick={() => setOpen(false)}><IconSchool size={17} /> My School</Link>
          <Link href="/me/documents" className="menu__item" onClick={() => setOpen(false)}><IconDoc size={17} /> My Documents</Link>
          <Link href="/me/settings" className="menu__item" onClick={() => setOpen(false)}><IconUser size={17} /> Profile &amp; settings</Link>
          <button className="menu__item" onClick={logout}>Log out</button>
        </div>
      ) : null}
    </div>
  );
}
