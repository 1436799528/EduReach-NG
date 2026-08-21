import type { Metadata } from 'next';
import { GpaCalculator } from '@/components/calculators';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GPA Calculator — Nigerian university grading scales',
  description: 'Calculate your semester GPA exactly: credit units × grade points. Supports 5.0, 4.0 and 7.0 scales used in Nigerian universities.'
};

export default function GpaCalculatorPage() {
  return (
    <div className="container section">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem' }}>GPA Calculator</h1>
        <p className="muted">Enter each course with its credit units and grade (or score). Instant, exact, private — nothing is stored.</p>
        <div className="card card--pad-lg mt-2">
          <GpaCalculator />
        </div>
        <p className="small muted mt-2">
          Working toward a target? Use <Link href="/tools/cgpa-target">Can I Still Get This CGPA?</Link> to see exactly what it will take.
        </p>
      </div>
    </div>
  );
}
