import type { Metadata } from 'next';
import Link from 'next/link';
import { ADMISSION_GUIDE } from '@/lib/content/guides';

export const metadata: Metadata = {
  title: 'University admission in Nigeria — post-UTME, cut-offs, clearance checklist',
  description: 'How admission into Nigerian universities works: post-UTME screening, cut-off marks, O\'Level requirements and the typical clearance documents checklist.'
};

export default function AdmissionPage() {
  return (
    <div className="container section">
      <div style={{ maxWidth: 780 }}>
        <span className="hero__eyebrow">Admission · {ADMISSION_GUIDE.updatedLabel}</span>
        <h1 style={{ fontSize: '2.2rem' }}>{ADMISSION_GUIDE.title}</h1>
        <p className="muted" style={{ fontSize: '1.05rem' }}>{ADMISSION_GUIDE.summary}</p>

        <div className="stack mt-3" style={{ gap: 20 }}>
          {ADMISSION_GUIDE.sections.map((s) => (
            <section key={s.title} className="card">
              <h2 style={{ fontSize: '1.2rem' }}>{s.title}</h2>
              {s.body.map((p, i) => <p key={i} style={{ marginBottom: '0.6em' }}>{p}</p>)}
            </section>
          ))}
        </div>

        <div className="card mt-3" style={{ borderLeft: '4px solid var(--green)' }}>
          <h3 style={{ marginBottom: 4 }}>Cut-off marks for your school</h3>
          <p className="muted" style={{ marginBottom: 10 }}>We track them with sources and verification labels — starting with UNICAL.</p>
          <Link href="/universities/university-of-calabar" className="btn btn--primary btn--sm">View UNICAL cut-offs</Link>
        </div>
      </div>
    </div>
  );
}
