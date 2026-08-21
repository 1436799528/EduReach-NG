import type { Metadata } from 'next';
import Link from 'next/link';
import { listInstitutions } from '@/lib/data/institutions';
import { IconSchool, IconArrowRight } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Nigerian university directory',
  description: 'Verified profiles of Nigerian tertiary institutions — starting deep with the University of Calabar (UNICAL).'
};
export const dynamic = 'force-dynamic';

export default function UniversitiesPage() {
  const institutions = listInstitutions();

  return (
    <div className="container section">
      <h1 style={{ fontSize: '2.2rem' }}>University directory</h1>
      <p className="muted" style={{ maxWidth: '62ch' }}>
        Real, verified information for real institutions — no filler data. We&apos;re deep on UNICAL first;
        UNILAG, LASU, UNIBEN, UNN, FUTA, ABU and others follow.
      </p>

      <div className="grid grid--2 mt-3">
        {institutions.map((i) => (
          <Link key={i.id} href={`/universities/${i.slug}`} className="action-tile">
            <span className="action-tile__icon action-tile__icon--find"><IconSchool size={22} /></span>
            <h3>{i.name}{i.short_name ? ` (${i.short_name})` : ''}</h3>
            <p>{i.type === 'UNIVERSITY' ? 'Federal University' : i.type.replace(/_/g, ' ')} · {i.state}{i.city ? `, ${i.city}` : ''}</p>
            <span className="small" style={{ fontWeight: 700, color: 'var(--green)' }}>View profile <IconArrowRight size={14} /></span>
          </Link>
        ))}
      </div>

      <div className="notice notice--info mt-3">
        Your school isn&apos;t here yet? <Link href="/register">Create an account</Link> and watch this space — expansion is
        driven by student demand.
      </div>
    </div>
  );
}
