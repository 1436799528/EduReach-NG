import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconCalc } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Free academic tools — GPA calculator, CGPA target checker',
  description: 'Exact GPA and CGPA calculators for Nigerian university students, plus the "Can I still get this CGPA?" target checker.'
};

export default function ToolsPage() {
  return (
    <div className="container section">
      <span className="hero__eyebrow">Free &amp; instant</span>
      <h1 style={{ fontSize: '2.2rem' }}>Academic calculators</h1>
      <p className="muted" style={{ maxWidth: '60ch' }}>
        Deterministic math — no AI guessing, no sign-up needed. Supports 5.0, 4.0 and 7.0 grading scales.
      </p>
      <div className="grid grid--2 mt-3">
        <Link href="/tools/gpa-calculator" className="action-tile">
          <span className="action-tile__icon action-tile__icon--calc"><IconCalc size={22} /></span>
          <h3>GPA Calculator</h3>
          <p>Compute your semester GPA from courses, units and grades — by letter grade or raw score.</p>
          <span className="small" style={{ fontWeight: 700, color: 'var(--green)' }}>Open tool <IconArrowRight size={14} /></span>
        </Link>
        <Link href="/tools/cgpa-target" className="action-tile">
          <span className="action-tile__icon action-tile__icon--calc"><IconCalc size={22} /></span>
          <h3>Can I Still Get This CGPA?</h3>
          <p>Enter your current CGPA, completed and remaining units, and target — get the exact average you need and honest scenarios.</p>
          <span className="small" style={{ fontWeight: 700, color: 'var(--green)' }}>Open tool <IconArrowRight size={14} /></span>
        </Link>
      </div>
    </div>
  );
}
