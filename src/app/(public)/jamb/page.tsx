import type { Metadata } from 'next';
import Link from 'next/link';
import { JAMB_GUIDES } from '@/lib/content/guides';

export const metadata: Metadata = {
  title: 'JAMB & UTME guide — registration, CAPS, results, official links',
  description: 'Curated JAMB/UTME guidance for Nigerian candidates: registration steps, CAPS admission status, result checking, change of course/institution — with official links to verify dates.'
};

export default function JambPage() {
  return (
    <div className="container section">
      <div style={{ maxWidth: 780 }}>
        <span className="hero__eyebrow">JAMB &amp; UTME · {JAMB_GUIDES.updatedLabel}</span>
        <h1 style={{ fontSize: '2.2rem' }}>{JAMB_GUIDES.title}</h1>
        <p className="muted" style={{ fontSize: '1.05rem' }}>{JAMB_GUIDES.summary}</p>

        <div className="notice notice--warn mt-2">
          <strong>Important:</strong> JAMB dates and fees change every year. This page teaches you the process;
          always confirm time-sensitive details on the official channels linked below each section.
        </div>

        <div className="stack mt-3" style={{ gap: 20 }}>
          {JAMB_GUIDES.sections.map((s) => (
            <section key={s.title} className="card">
              <h2 style={{ fontSize: '1.2rem' }}>{s.title}</h2>
              {s.body.map((p, i) => <p key={i} className={i < s.body.length - 1 ? '' : 'muted'} style={{ marginBottom: '0.6em' }}>{p}</p>)}
              {s.links ? (
                <div className="pill-list mt-1">
                  {s.links.map((l) => (
                    <a key={l.url} className="pill" href={l.url} target="_blank" rel="noopener noreferrer">↗ {l.label}</a>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <div className="card mt-3" style={{ borderLeft: '4px solid var(--green)' }}>
          <h3 style={{ marginBottom: 4 }}>Waiting on admission?</h3>
          <p className="muted">Track your status the right way and prepare your clearance documents early.</p>
          <div className="row row--wrap">
            <Link href="/admission" className="btn btn--outline btn--sm">Read the admission guide</Link>
            <Link href="/universities" className="btn btn--ghost btn--sm">Browse universities</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
