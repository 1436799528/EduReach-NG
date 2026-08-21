'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fmtDate } from '@/lib/format';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  email_verified_at: string | null;
  created_at: string;
}

const ROLES = ['STUDENT', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];

export function UsersTable({ users, isSuper, selfId }: { users: AdminUser[]; isSuper: boolean; selfId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');

  async function patch(id: string, payload: { role?: string; status?: string }) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 200) {
      setMsg('Saved.');
      router.refresh();
    } else {
      setMsg(data.error ?? 'Action failed.');
    }
    setTimeout(() => setMsg(''), 2500);
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      {msg ? <div className="form-success">{msg}</div> : null}
      {!isSuper ? <div className="notice notice--info">Role and status changes require a super administrator.</div> : null}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.full_name}</strong> {u.id === selfId ? <span className="tag">you</span> : null}
                  <div className="small muted">{u.email} {u.email_verified_at ? '✓' : '(unverified)'}</div>
                </td>
                <td>
                  {isSuper && u.id !== selfId ? (
                    <select aria-label="role" defaultValue={u.role} onChange={(e) => patch(u.id, { role: e.target.value })} style={{ minHeight: 34, fontSize: '0.85rem', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--line-strong)' }}>
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                    </select>
                  ) : (
                    u.role.replace(/_/g, ' ')
                  )}
                </td>
                <td>{u.status}</td>
                <td className="small">{fmtDate(u.created_at)}</td>
                <td>
                  {isSuper && u.id !== selfId ? (
                    u.status === 'ACTIVE' ? (
                      <button className="btn btn--danger-outline btn--sm" onClick={() => patch(u.id, { status: 'SUSPENDED' })}>Suspend</button>
                    ) : (
                      <button className="btn btn--outline btn--sm" onClick={() => patch(u.id, { status: 'ACTIVE' })}>Reactivate</button>
                    )
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
