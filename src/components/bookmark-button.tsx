'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function BookmarkButton({ kind, title, url, initialSaved = false }: {
  kind: 'ANNOUNCEMENT' | 'PAGE' | 'RESOURCE' | 'LETTER';
  title: string;
  url: string;
  initialSaved?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const res = await fetch('/api/bookmarks', {
      method: saved ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saved ? { url } : { kind, title, url })
    });
    setBusy(false);
    if (res.status === 401) {
      router.push(`/login?next=${encodeURIComponent(url)}`);
      return;
    }
    if (res.ok) setSaved(!saved);
  }

  return (
    <button className={`btn btn--sm ${saved ? 'btn--outline' : 'btn--ghost'}`} onClick={toggle} disabled={busy} aria-pressed={saved}>
      {saved ? '★ Saved' : '☆ Save'}
    </button>
  );
}
