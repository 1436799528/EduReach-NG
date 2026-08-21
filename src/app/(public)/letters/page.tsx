import type { Metadata } from 'next';
import Link from 'next/link';
import { LETTER_TEMPLATES } from '@/lib/letters/registry';
import { TemplateGallery } from '@/components/template-gallery';

export const metadata: Metadata = {
  title: 'Nigerian academic letter templates — appeals, requests, explanations',
  description: 'Generate properly formatted Nigerian university letters: late registration appeals, result corrections, SIWES requests, leave letters, reinstatement requests and more.'
};

export default function LettersDirectoryPage() {
  return (
    <div className="container section">
      <span className="hero__eyebrow">Write Center</span>
      <h1 style={{ fontSize: '2.2rem' }}>Official letters, written properly</h1>
      <p className="muted" style={{ maxWidth: '64ch' }}>
        Pick a document, fill only what applies to you, and get a correctly formatted letter following
        Nigerian academic conventions. Missing details stay as <code>[PLACEHOLDERS]</code> — we never invent
        names, titles or facts.
      </p>
      <div className="mt-3">
        <TemplateGallery
          templates={LETTER_TEMPLATES.map((t) => ({ key: t.key, title: t.title, description: t.description, category: t.category, version: t.version }))}
          hrefBase="/write"
        />
      </div>
      <p className="small muted mt-3">
        <Link href="/register">Create a free account</Link> to save generated letters to My Documents and keep your identity fields pre-filled.
      </p>
    </div>
  );
}
