'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { composeLetter, letterToText, type ComposedLetter } from '@/lib/letters/render';
import { getTemplate } from '@/lib/letters/registry';
import type { LetterValues } from '@/lib/letters/types';

export function LetterStudio({ templateKey, prefill }: { templateKey: string; prefill: LetterValues }) {
  const router = useRouter();
  const template = getTemplate(templateKey);
  const [values, setValues] = useState<LetterValues>(() => ({ ...prefill, date: prefill.date ?? new Date().toISOString().slice(0, 10) }));
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'' | 'copy' | 'pdf' | 'save'>('');

  const letter: ComposedLetter | null = useMemo(
    () => (template ? composeLetter(template, values) : null),
    [template, values]
  );

  if (!template || !letter) {
    return <div className="notice notice--warn">Unknown template. <a href="/write">Back to Write Center</a>.</div>;
  }

  function set(key: string, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function copyText() {
    setBusy('copy');
    try {
      await navigator.clipboard.writeText(letterToText(letter!));
      setNotice('Copied — paste it anywhere.');
    } catch {
      setNotice('Copy failed in this browser. Select the text manually.');
    }
    setBusy('');
    setTimeout(() => setNotice(''), 3000);
  }

  async function downloadPdf() {
    setBusy('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 56;
      const width = doc.internal.pageSize.getWidth() - margin * 2;
      let y = 72;
      doc.setFont('times', 'normal');
      doc.setFontSize(12);

      const lines = (text: string) => doc.splitTextToSize(text, width) as string[];
      const write = (text: string, opts: { gap?: number; bold?: boolean; alignRight?: boolean; underline?: boolean } = {}) => {
        doc.setFont('times', opts.bold ? 'bold' : 'normal');
        for (const line of lines(text)) {
          if (y > 780) { doc.addPage(); y = 72; }
          if (opts.alignRight) doc.text(line, margin + width, y, { align: 'right' });
          else doc.text(line, margin, y);
          if (opts.underline) {
            const tw = doc.getTextWidth(line);
            const x = opts.alignRight ? margin + width - tw : margin;
            doc.line(x, y + 2, x + tw, y + 2);
          }
          y += 16;
        }
        y += opts.gap ?? 10;
        doc.setFont('times', 'normal');
      };

      write(letter!.senderBlock.join('\n'), { gap: 6 });
      write(letter!.dateLine, { alignRight: true, gap: 6 });
      write(letter!.recipientBlock.join('\n'), { gap: 6 });
      write(letter!.greeting, { gap: 6 });
      write(`RE: ${letter!.subject}`, { bold: true, underline: true, gap: 10 });
      for (const p of letter!.paragraphs) write(p, { gap: 8 });
      write(letter!.closing, { gap: 18 });
      write(letter!.signatureBlock.join('\n'), { gap: 0 });

      doc.save(`${template!.key}.pdf`);
      setNotice('PDF downloaded.');
    } catch {
      setNotice('Could not create the PDF. Try the Print button and choose "Save as PDF".');
    }
    setBusy('');
    setTimeout(() => setNotice(''), 3000);
  }

  async function saveToDocuments() {
    setBusy('save');
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey: template!.key, title: template!.title, values })
      });
      if (res.status === 401) {
        setNotice('Log in to save documents. Your text is safe on this page.');
      } else if (res.status !== 201) {
        const data = await res.json().catch(() => ({}));
        setNotice(data.error ?? 'Could not save. Please try again.');
      } else {
        setNotice('Saved to My Documents.');
        router.refresh();
      }
    } finally {
      setBusy('');
      setTimeout(() => setNotice(''), 3000);
    }
  }

  const missing = letter.placeholders;

  return (
    <div className="studio">
      {/* Form */}
      <div className="card studio--sticky no-print">
        <div className="card__title">
          <h3>{template.title}</h3>
          <span className="tag">v{template.version}</span>
        </div>
        <p className="small muted" style={{ marginTop: 0 }}>{template.description}</p>

        {template.fields.map((f) => (
          <div className="field" key={f.key}>
            <label htmlFor={`f-${f.key}`} className={f.required ? 'req' : ''}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea id={`f-${f.key}`} value={values[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />
            ) : f.type === 'select' ? (
              <select id={`f-${f.key}`} value={values[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                <option value="">Choose…</option>
                {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input id={`f-${f.key}`} type={f.type === 'date' ? 'date' : 'text'} value={values[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />
            )}
          </div>
        ))}

        {missing.length > 0 ? (
          <div className="notice notice--warn small">
            Missing details will keep a placeholder: {missing.slice(0, 6).join(' ')}{missing.length > 6 ? '…' : ''}
          </div>
        ) : (
          <div className="notice notice--ok small">All details filled — this letter is ready.</div>
        )}

        <div className="stack mt-2" style={{ gap: 8 }}>
          <button className="btn btn--primary btn--block" onClick={downloadPdf} disabled={busy === 'pdf'}>
            {busy === 'pdf' ? 'Creating PDF…' : 'Download PDF'}
          </button>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--outline grow" onClick={copyText} disabled={busy === 'copy'}>Copy text</button>
            <button className="btn btn--outline grow" onClick={() => window.print()}>Print</button>
          </div>
          <button className="btn btn--ghost btn--block" onClick={saveToDocuments} disabled={busy === 'save'}>
            {busy === 'save' ? 'Saving…' : 'Save to My Documents'}
          </button>
          {notice ? <p className="small muted" style={{ margin: 0, textAlign: 'center' }}>{notice}</p> : null}
        </div>
      </div>

      {/* Preview */}
      <div>
        <div className="paper" aria-label="Letter preview">
          <div className="sender">{letter.senderBlock.join('\n')}</div>
          <div className="date-line">{letter.dateLine}</div>
          <div className="recipient">{letter.recipientBlock.join(',\n').replace(/,\n([^\n]*)$/, ',\n$1')},</div>
          <p style={{ marginTop: 18 }}>{letter.greeting}</p>
          <div className="subject">RE: {letter.subject}</div>
          {letter.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          <p style={{ marginTop: 26 }}>{letter.closing}</p>
          <div className="sender">{letter.signatureBlock.join('\n')}</div>
        </div>
        <p className="small muted mt-1 no-print" style={{ textAlign: 'center' }}>
          Review carefully before submitting. EduReach formats the letter — the facts and the facts-checking are yours.
        </p>
      </div>
    </div>
  );
}
