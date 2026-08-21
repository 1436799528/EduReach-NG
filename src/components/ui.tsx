import React from 'react';
import { cx } from '@/lib/format';

/** Verification status badge (§37 trust model — plain labels). */
export function VerificationBadge({ status, className }: { status: string; className?: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    VERIFIED: { label: 'Officially verified', cls: 'badge--verified' },
    REPORTED: { label: 'Source reported', cls: 'badge--reported' },
    UNDER_REVIEW: { label: 'Source reported', cls: 'badge--reported' },
    COMMUNITY: { label: 'Community submitted', cls: 'badge--community' },
    PENDING: { label: 'Needs verification', cls: 'badge--pending' },
    OUTDATED: { label: 'Outdated', cls: 'badge--outdated' },
    REJECTED: { label: 'Rejected', cls: 'badge--rejected' },
    ARCHIVED: { label: 'Archived', cls: 'badge--archived' }
  };
  const v = map[status] ?? { label: status, cls: 'badge--pending' };
  return <span className={cx('badge', v.cls, className)}>{v.label}</span>;
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  if (urgency === 'URGENT') return <span className="badge badge--urgent">Urgent</span>;
  if (urgency === 'IMPORTANT') return <span className="badge badge--important">Important</span>;
  return null;
}

export function CategoryTag({ label }: { label: string }) {
  return <span className="tag">{label.replace(/_/g, ' ')}</span>;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">◇</div>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
      {hint ? <div className="stat__hint">{hint}</div> : null}
    </div>
  );
}
