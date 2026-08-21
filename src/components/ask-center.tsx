'use client';

import { useMemo, useState } from 'react';
import { FAQS, searchFaqs } from '@/lib/content/faqs';

export function AskCenter({ initialQuery = '' }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const results = useMemo(() => (q.trim() ? searchFaqs(q) : FAQS), [q]);

  return (
    <>
      <div className="row mb-2">
        <input
          className="input grow"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Ask something — e.g. "How do I write a suspension letter?"'
          aria-label="Ask a question"
        />
      </div>

      {q.trim() && results.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No curated answer yet</h3>
          <p className="muted">Try different words, or check these always-useful places:</p>
          <ul className="small">
            <li><a href="/jamb">JAMB &amp; UTME guide</a> — registration, CAPS, results</li>
            <li><a href="/admission">Admission guide</a> — screening, cut-offs, clearance</li>
            <li><a href="/letters">Letter generator</a> — if you need to write something official</li>
          </ul>
        </div>
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          {results.map((f) => (
            <article key={f.key} className="card">
              <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{f.question}</h3>
              {f.answer.map((p, i) => <p key={i} className={i === f.answer.length - 1 ? 'muted' : ''} style={{ marginBottom: '0.6em' }}>{p}</p>)}
              {f.links.length > 0 ? (
                <div className="pill-list mt-1">
                  {f.links.map((l) => (
                    <a key={l.url} className="pill" href={l.url} target={l.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      {l.url.startsWith('http') ? '↗ ' : ''}{l.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <p className="small muted mt-3">
        Answers are curated by editors and link to tools or official sources — EduReach never invents
        school-specific facts. An AI assistant will sit on top of this verified knowledge later.
      </p>
    </>
  );
}
