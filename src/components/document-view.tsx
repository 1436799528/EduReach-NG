'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DocumentView({ id, title, content }: { id: string | null; title: string; content: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setNotice('Copied to clipboard.');
    } catch {
      setNotice('Copy failed in this browser.');
    }
    setTimeout(() => setNotice(''), 2500);
  }

  async function pdf() {
    setBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 56;
      const width = doc.internal.pageSize.getWidth() - margin * 2;
      let y = 72;
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      for (const rawLine of content.split('\n')) {
        const isSubject = rawLine.startsWith('RE:');
        doc.setFont('times', isSubject ? 'bold' : 'normal');
        const wrapped = doc.splitTextToSize(rawLine || ' ', width) as string[];
        for (const line of wrapped) {
          if (y > 780) { doc.addPage(); y = 72; }
          doc.text(line, margin, y);
          y += 16;
        }
      }
      doc.save(`${title.replace(/[^\w\- ]/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'document'}.pdf`);
      setNotice('PDF downloaded.');
    } catch {
      setNotice('Could not create the PDF — try Print and choose "Save as PDF".');
    }
    setBusy(false);
    setTimeout(() => setNotice(''), 2500);
  }

  async function remove() {
    if (!id) return;
    if (!window.confirm('Delete this document permanently?')) return;
    setBusy(true);
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (res.status === 200) {
      router.push('/me/documents');
      router.refresh();
    } else {
      setNotice('Could not delete. Please try again.');
    }
  }

  // Render stored plain-text letter with light structure
  const blocks = content.split('\n');
  return (
    <div>
      <div className="row mb-2 no-print">
        <button className="btn btn--primary btn--sm" onClick={pdf} disabled={busy}>{busy ? 'Working…' : 'Download PDF'}</button>
        <button className="btn btn--outline btn--sm" onClick={copy}>Copy</button>
        <button className="btn btn--outline btn--sm" onClick={() => window.print()}>Print</button>
        {id ? <button className="btn btn--danger-outline btn--sm" onClick={remove} disabled={busy}>Delete</button> : null}
        {notice ? <span className="small muted">{notice}</span> : null}
      </div>
      <div className="paper">
        {blocks.map((line, i) => {
          if (line.startsWith('RE:')) return <div key={i} className="subject">{line}</div>;
          if (line.trim() === '') return <div key={i} style={{ height: 10 }} />;
          return <p key={i} style={{ margin: '0 0 2px' }}>{line}</p>;
        })}
      </div>
    </div>
  );
}
