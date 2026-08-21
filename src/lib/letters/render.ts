import type { ComposedLetter, LetterTemplate, LetterValues, VHelper } from './types';

export type { ComposedLetter, LetterValues } from './types';

export function placeholder(label: string): string {
  return `[${label.trim().toUpperCase()}]`;
}

/** Builds the interpolation helper. Missing data becomes [LABEL] — never invented. */
export function makeHelper(values: LetterValues): VHelper {
  const raw = (key: string) => (values[key] ?? '').trim();
  const t = (key: string, placeholderLabel?: string) => {
    const v = raw(key);
    if (v) return v;
    return placeholder(placeholderLabel ?? key.replace(/([A-Z])/g, ' $1'));
  };
  return { t, raw };
}

const PLACEHOLDER_RE = /\[[A-Z][A-Z0-9 /''.-]*\]/g;

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function composeLetter(template: LetterTemplate, values: LetterValues): ComposedLetter {
  const h = makeHelper(values);

  const senderBlock: string[] = [h.t('fullName', 'Full name')];
  if ((values.matricNumber ?? '').trim()) senderBlock.push(`Matric No: ${h.raw('matricNumber')}`);
  if ((values.department ?? '').trim()) senderBlock.push(`Department of ${h.raw('department')}`);
  if ((values.faculty ?? '').trim()) senderBlock.push(`Faculty of ${h.raw('faculty')}`);
  senderBlock.push(h.t('institution', 'Institution'));

  const dateLine = (values.date ?? '').trim() ? formatDate(h.raw('date')) : placeholder('Date');

  const recipientBlock: string[] = [template.recipientTitle];
  if ((values.recipientOffice ?? '').trim()) recipientBlock.push(h.raw('recipientOffice'));
  else if ((values.department ?? '').trim() && template.key !== 'letter-dean') {
    recipientBlock.push(`Department of ${h.raw('department')}`);
  }
  recipientBlock.push(h.t('institution', 'Institution'));

  const closing = 'Yours faithfully,';
  const signatureBlock = ['_______________________________', h.t('fullName', 'Full name')];
  if ((values.matricNumber ?? '').trim()) signatureBlock.push(h.raw('matricNumber'));

  const paragraphs = template.paragraphs(h).filter((p) => p.trim().length > 0);
  const subject = template.subject(h).toUpperCase();

  const allText = [...senderBlock, dateLine, ...recipientBlock, subject, ...paragraphs, closing, ...signatureBlock].join('\n');
  const placeholders = Array.from(new Set(allText.match(PLACEHOLDER_RE) ?? []));

  return {
    senderBlock,
    dateLine,
    recipientBlock,
    greeting: template.greeting ?? 'Dear Sir/Madam,',
    subject,
    paragraphs,
    closing,
    signatureBlock,
    placeholders
  };
}

export function letterToText(letter: ComposedLetter): string {
  return [
    ...letter.senderBlock,
    '',
    letter.dateLine,
    '',
    ...letter.recipientBlock,
    '',
    letter.greeting,
    '',
    `RE: ${letter.subject}`,
    '',
    ...letter.paragraphs.flatMap((p) => [p, '']),
    letter.closing,
    '',
    ...letter.signatureBlock
  ].join('\n');
}
