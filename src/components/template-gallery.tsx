'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IconPen } from '@/components/icons';

interface Lite { key: string; title: string; description: string; category: string; version: string }

export function TemplateGallery({ templates, hrefBase }: { templates: Lite[]; hrefBase: string }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');

  const categories = useMemo(() => Array.from(new Set(templates.map((t) => t.category))).sort(), [templates]);
  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return templates.filter((t) => {
      if (cat && t.category !== cat) return false;
      if (!needle) return true;
      return `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(needle);
    });
  }, [templates, q, cat]);

  return (
    <>
      <div className="row row--wrap mb-2">
        <input
          className="input"
          style={{ maxWidth: 380 }}
          type="search"
          placeholder="Search letters — e.g. suspension, SIWES, late registration…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search letter templates"
        />
        <div className="pill-list">
          <button className={`pill ${cat === '' ? 'active' : ''}`} onClick={() => setCat('')}>All</button>
          {categories.map((c) => (
            <button key={c} className={`pill ${cat === c ? 'active' : ''}`} onClick={() => setCat(c === cat ? '' : c)}>{c}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><p className="muted" style={{ margin: 0 }}>No template matches. Try &ldquo;appeal&rdquo;, &ldquo;request&rdquo; or the Custom Formal Letter.</p></div>
      ) : (
        <div className="grid grid--3">
          {filtered.map((t) => (
            <Link key={t.key} href={`${hrefBase}/${t.key}`} className="action-tile">
              <div className="row">
                <span className="action-tile__icon action-tile__icon--write" style={{ width: 36, height: 36 }}><IconPen size={18} /></span>
                <span className="tag">{t.category}</span>
              </div>
              <h3 style={{ fontSize: '1.02rem' }}>{t.title}</h3>
              <p>{t.description}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
