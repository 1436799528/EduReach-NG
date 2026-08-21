import type { Metadata } from 'next';
import { AskCenter } from '@/components/ask-center';

export const metadata: Metadata = {
  title: 'Ask — practical answers about Nigerian university life',
  description: 'Clear answers to practical questions: clearance documents, JAMB CAPS, CGPA, missed registration, SIWES, carryovers and more.'
};
export const dynamic = 'force-dynamic';

export default function AskPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div className="container section">
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem' }}>Ask</h1>
        <p className="muted">Practical questions about university life and procedures, answered plainly.</p>
        <div className="mt-2">
          <AskCenter initialQuery={searchParams.q ?? ''} />
        </div>
      </div>
    </div>
  );
}
