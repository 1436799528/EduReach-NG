import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="container section">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem' }}>About EduReach NG</h1>
        <p style={{ fontSize: '1.05rem' }}>
          A Nigerian tertiary student&apos;s day already has enough friction: portals that time out, dates that move,
          letters nobody shows you how to write, and critical announcements buried in WhatsApp noise.
        </p>
        <p className="muted">
          EduReach NG is a digital front desk for that reality. It helps you find reliable school information,
          generate properly formatted official letters, calculate your GPA/CGPA exactly, track the deadlines that
          can cost you money or a semester, and get straight answers about university procedures.
        </p>
        <p className="muted">
          We are launching deep with the University of Calabar, then expanding institution by institution — never
          padding the directory with fake or unverified data.
        </p>
        <div className="card mt-3" style={{ borderLeft: '4px solid var(--green)' }}>
          <div className="row row--wrap spread">
            <p style={{ margin: 0 }}><strong>Have a school problem right now?</strong></p>
            <Link href="/register" className="btn btn--primary btn--sm">Start here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
