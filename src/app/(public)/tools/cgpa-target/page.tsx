import type { Metadata } from 'next';
import { CgpaTargetTool } from '@/components/calculators';

export const metadata: Metadata = {
  title: 'Can I Still Get This CGPA? — target checker',
  description: 'Check whether your target CGPA is mathematically possible, the exact average GPA you need, and best/average/low scenarios.'
};

export default function CgpaTargetPage() {
  return (
    <div className="container section">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem' }}>Can I still get this CGPA?</h1>
        <p className="muted">
          The honest answer, computed exactly. Your remaining credit units decide how much room you have left to move the average.
        </p>
        <div className="card card--pad-lg mt-2">
          <CgpaTargetTool />
        </div>
      </div>
    </div>
  );
}
