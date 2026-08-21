import { describe, expect, it } from 'vitest';
import { composeLetter, letterToText, makeHelper, placeholder } from './render';
import { getTemplate, LETTER_TEMPLATES } from './registry';

const LATE_REG = getTemplate('late-registration-appeal')!;

describe('template registry', () => {
  it('contains the core document types', () => {
    const keys = LETTER_TEMPLATES.map((t) => t.key);
    for (const k of ['letter-hod', 'late-registration-appeal', 'result-correction', 'siwes-request', 'reinstatement-request', 'custom-formal']) {
      expect(keys).toContain(k);
    }
    expect(LETTER_TEMPLATES.length).toBeGreaterThanOrEqual(15);
  });

  it('every template is versioned and has required structure', () => {
    for (const t of LETTER_TEMPLATES) {
      expect(t.version).toMatch(/^\d+\.\d+$/);
      expect(t.fields.length).toBeGreaterThan(0);
      expect(t.recipientTitle.length).toBeGreaterThan(0);
      expect(t.key).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe('makeHelper', () => {
  it('returns values trimmed', () => {
    const h = makeHelper({ fullName: '  Ada Lovelace  ' });
    expect(h.t('fullName')).toBe('Ada Lovelace');
  });

  it('renders [PLACEHOLDER] in caps for missing data — never fabricates', () => {
    const h = makeHelper({});
    expect(h.t('matricNumber', 'Matric number')).toBe('[MATRIC NUMBER]');
    expect(placeholder('HOD name')).toBe('[HOD NAME]');
  });
});

describe('composeLetter', () => {
  const full = {
    fullName: 'Adaeze Okafor',
    matricNumber: '21/0457',
    department: 'Computer Science',
    faculty: 'Physical Sciences',
    level: '300',
    institution: 'University of Calabar',
    date: '2026-08-21',
    session: '2025/2026',
    semester: 'Second',
    reason: 'a family emergency that took me out of Calabar',
    supportingDetails: 'I have attached my travel documents.'
  };

  it('builds a complete Nigerian formal letter', () => {
    const letter = composeLetter(LATE_REG, full);
    const text = letterToText(letter);

    expect(letter.senderBlock[0]).toBe('Adaeze Okafor');
    expect(letter.senderBlock).toContain('Matric No: 21/0457');
    expect(letter.recipientBlock[0]).toBe('The Head of Department,');
    expect(letter.recipientBlock).toContain('Department of Computer Science');
    expect(letter.greeting).toBe('Dear Sir/Madam,');
    expect(letter.subject).toBe('APPEAL FOR LATE COURSE REGISTRATION');
    expect(text).toContain('RE: APPEAL FOR LATE COURSE REGISTRATION');
    expect(text).toContain('Yours faithfully,');
    expect(text).toContain('2025/2026 academic session');
    expect(text).toContain('a family emergency');
    expect(letter.placeholders).toHaveLength(0);
    // Date rendered in Nigerian long format
    expect(letter.dateLine).toBe('21 August 2026');
  });

  it('uses uppercase placeholders when data is missing (§9)', () => {
    const letter = composeLetter(LATE_REG, { fullName: 'Adaeze Okafor', institution: 'University of Calabar', date: '2026-08-21' });
    const text = letterToText(letter);

    expect(text).toContain('[MATRIC NUMBER]');
    expect(text).toContain('[ACADEMIC SESSION]');
    expect(letter.placeholders.length).toBeGreaterThan(0);
    // Must never invent a name/authority
    expect(text).not.toContain('Professor');
  });

  it('handles missing date with a [DATE] placeholder', () => {
    const letter = composeLetter(LATE_REG, full);
    const missingDate = composeLetter(LATE_REG, { ...full, date: '' });
    expect(letter.dateLine).not.toContain('[');
    expect(missingDate.dateLine).toBe('[DATE]');
  });

  it('omits optional supporting paragraph when empty', () => {
    const letter = composeLetter(LATE_REG, { ...full, supportingDetails: '' });
    expect(letter.paragraphs.join('\n')).not.toContain('In support of this appeal');
  });
});
