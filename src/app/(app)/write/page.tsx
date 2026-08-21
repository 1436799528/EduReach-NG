import type { Metadata } from 'next';
import { LETTER_TEMPLATES, LETTER_CATEGORIES } from '@/lib/letters/registry';
import { TemplateGallery } from '@/components/template-gallery';

export const metadata: Metadata = { title: 'Write Center' };
export const dynamic = 'force-dynamic';

export default function WritePage() {
  return (
    <div>
      <div className="page-head">
        <h1 style={{ fontSize: '1.8rem' }}>Write Center</h1>
        <p>
          {LETTER_TEMPLATES.length} templates across {LETTER_CATEGORIES.length} categories. The form only asks
          for what that document needs; anything you skip stays a clearly-marked placeholder.
        </p>
      </div>
      <TemplateGallery
        templates={LETTER_TEMPLATES.map((t) => ({ key: t.key, title: t.title, description: t.description, category: t.category, version: t.version }))}
        hrefBase="/write"
      />
    </div>
  );
}
