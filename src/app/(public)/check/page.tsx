import type { Metadata } from 'next';
import Link from 'next/link';
import { listVerifiedAnnouncements } from '@/lib/data/content';
import { AnnouncementFeed } from '@/components/announcement-feed';

export const metadata: Metadata = {
  title: 'Verified updates — JAMB, admission & school announcements',
  description: 'JAMB, admission and university updates with sources, verification labels and last-verified dates. No rumours.'
};
export const dynamic = 'force-dynamic';

export default function CheckPage() {
  const items = listVerifiedAnnouncements({ limit: 60 });

  return (
    <div className="container section">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem' }}>Verified updates</h1>
        <p className="muted">
          Practical student information — not news gossip. Each card carries its source, a verification label and
          when it was last verified.
        </p>
        <AnnouncementFeed items={items} />
        <p className="small muted mt-3">
          Logged-in students get these personalised to their school — <Link href="/register">create a free account</Link>.
        </p>
      </div>
    </div>
  );
}
