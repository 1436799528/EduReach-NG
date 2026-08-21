import '@/lib/server-only';
import { searchAnnouncements, searchCutOffs, listApprovedResources } from '@/lib/data/content';
import { searchInstitutions } from '@/lib/data/institutions';
import { LETTER_TEMPLATES } from '@/lib/letters/registry';
import { TOOLS_DIRECTORY } from '@/lib/content/guides';
import { FAQS } from '@/lib/content/faqs';

/**
 * Global search (§46). Groups results by Tools / Letters / Information /
 * Announcements / Universities / Resources and tolerates common Nigerian
 * phrasings via a synonym map + token scoring.
 */

const SYNONYMS: [RegExp, string[]][] = [
  [/\b(cut\s?-?\s?off|cutoff)\b/i, ['cut-off', 'cut off mark', 'cutoff']],
  [/\buni(cal|lag|ben|jos|ilorin)\b/i, ['unical', 'university of calabar']],
  [/\bcalabar\b/i, ['unical', 'university of calabar']],
  [/\bsuspens\w*\b/i, ['reinstatement', 'suspension', 'rusticated']],
  [/\bpq|past\s?q\w*\b/i, ['past question', 'past questions']],
  [/\bcgpa\b/i, ['cgpa', 'calculator', 'target']],
  [/\bgpa\b/i, ['gpa', 'calculator']],
  [/\bsiwes\b|\bit\b/i, ['siwes', 'industrial training']],
  [/\bletter\b|\bwrite\b|\bdraft\b/i, ['letter', 'write', 'generator', 'template']],
  [/\bdeadline\b|\bexam\b/i, ['deadline', 'exam', 'tracker', 'countdown']]
];

function expandQuery(q: string): string[] {
  const tokens = new Set<string>();
  const norm = q.toLowerCase().trim();
  for (const t of norm.split(/[^a-z0-9']+/)) if (t) tokens.add(t);
  for (const [re, extras] of SYNONYMS) {
    if (re.test(norm)) for (const e of extras) tokens.add(e);
  }
  tokens.add(norm);
  return Array.from(tokens).filter(Boolean);
}

function scoreText(haystack: string, tokens: string[]): number {
  const h = haystack.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    if (h.includes(t)) score += Math.min(t.length, 20);
  }
  return score;
}

export interface SearchResults {
  tools: { title: string; description: string; url: string }[];
  letters: { title: string; description: string; url: string }[];
  info: { title: string; description: string; url: string }[];
  announcements: { title: string; description: string; url: string; meta: string }[];
  universities: { title: string; description: string; url: string }[];
  cutoffs: { title: string; description: string; url: string }[];
  resources: { title: string; description: string; url: string }[];
  total: number;
}

export function searchAll(rawQuery: string, ctx: { institutionId?: string | null } = {}): SearchResults {
  const q = rawQuery.trim().slice(0, 120);
  const tokens = expandQuery(q);

  const tools = TOOLS_DIRECTORY
    .map((t) => ({ t, s: scoreText(`${t.title} ${t.description} ${t.keywords}`, tokens) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map((r) => ({ title: r.t.title, description: r.t.description, url: r.t.url }));

  const letters = LETTER_TEMPLATES
    .map((t) => ({ t, s: scoreText(`${t.title} ${t.description} ${t.category} ${t.key.replace(/-/g, ' ')}`, tokens) }))
    .filter((r) => r.s > 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map((r) => ({ title: r.t.title, description: r.t.description, url: `/write/${r.t.key}` }));

  const infoItems = [
    { title: 'JAMB & UTME guide', description: 'Registration, CAPS, results, change of course — with official links.', url: '/jamb', keys: 'jamb utme registration caps result admission status' },
    { title: 'Admission guide', description: 'Post-UTME, cut-offs, O\'Level requirements, clearance checklist.', url: '/admission', keys: 'admission post utme screening cut off clearance olevel requirements' },
    { title: 'Ask Center', description: 'Curated answers about university procedures.', url: '/ask', keys: 'ask question how do i help' },
    ...FAQS.map((f) => ({ title: f.question, description: f.answer[0]!.slice(0, 140) + '…', url: `/ask?q=${encodeURIComponent(f.question)}`, keys: `${f.keywords} ${f.question}` }))
  ];
  const info = infoItems
    .map((t) => ({ t, s: scoreText(`${t.title} ${t.description} ${t.keys}`, tokens) }))
    .filter((r) => r.s > 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map((r) => ({ title: r.t.title, description: r.t.description, url: r.t.url }));

  const announcements = searchAnnouncements(q)
    .map((a) => ({
      r: a,
      s: scoreText(`${a.title} ${a.summary} ${a.institution_name ?? ''}`, tokens)
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map(({ r }) => ({
      title: r.title,
      description: r.summary,
      url: `/check#${r.id}`,
      meta: `${r.institution_name ?? 'National'} • ${r.category}`
    }));

  const universities = searchInstitutions(q)
    .map((u) => ({
      title: u.name + (u.short_name ? ` (${u.short_name})` : ''),
      description: `${u.type === 'UNIVERSITY' ? 'University' : u.type} • ${u.state}`,
      url: `/universities/${u.slug}`
    }))
    .slice(0, 6);

  const cutoffs = searchCutOffs(q).slice(0, 6).map((c) => ({
    title: `${c.programme} — ${c.session}`,
    description: `${c.institution_name ?? ''} • UTME cut-off: ${c.utme_cutoff ?? '—'} • ${statusLabel(c.status)}`,
    url: `/universities/${slugForInstitution(c.institution_id)}`
  }));

  const resources = listApprovedResources({ q })
    .slice(0, 6)
    .map((r) => ({
      title: r.title,
      description: `${r.type.replace(/_/g, ' ')}${r.course ? ` • ${r.course}` : ''}${r.institution_name ? ` • ${r.institution_name}` : ''}`,
      url: r.external_url ?? `/resources#${r.id}`
    }));

  const total = tools.length + letters.length + info.length + announcements.length + universities.length + cutoffs.length + resources.length;
  return { tools, letters, info, announcements, universities, cutoffs, resources, total };
}

function statusLabel(status: string): string {
  switch (status) {
    case 'VERIFIED': return 'Officially verified';
    case 'REPORTED': case 'UNDER_REVIEW': return 'Source reported';
    case 'OUTDATED': return 'Outdated';
    default: return 'Needs verification';
  }
}

import { findInstitutionById } from '@/lib/data/institutions';
function slugForInstitution(id: string): string {
  return findInstitutionById(id)?.slug ?? '';
}
