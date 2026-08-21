import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { findDocument } from '@/lib/data/workspace';
import { DocumentView } from '@/components/document-view';

export const metadata: Metadata = { title: 'View document' };
export const dynamic = 'force-dynamic';

export default function DocumentPage({ params }: { params: { id: string } }) {
  const session = getSessionUser();
  if (!session) redirect('/login');
  const doc = findDocument(session.user.id, params.id);
  if (!doc) notFound();

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <p className="small no-print" style={{ marginBottom: 8 }}><Link href="/me/documents">← My Documents</Link></p>
      <h1 className="no-print" style={{ fontSize: '1.5rem' }}>{doc.title}</h1>
      <DocumentView id={doc.id} title={doc.title} content={doc.content} />
    </div>
  );
}
