/** Write Center — letter template domain model (§9, §42). Templates are data. */

export type FieldType = 'text' | 'textarea' | 'date' | 'select';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export type LetterValues = Record<string, string>;

/** Helper passed to template body authors for placeholder-safe interpolation. */
export interface VHelper {
  /** Value for a field key, or `[LABEL]` in caps when empty — never fabricates. */
  t: (key: string, placeholderLabel?: string) => string;
  /** Raw trimmed value (may be empty string). */
  raw: (key: string) => string;
}

export interface LetterTemplate {
  key: string;
  title: string;
  description: string;
  category: string;
  version: string;
  recipientTitle: string;
  greeting?: string;
  fields: FieldDef[];
  subject: (h: VHelper) => string;
  paragraphs: (h: VHelper) => string[];
}

export interface ComposedLetter {
  senderBlock: string[];
  dateLine: string;
  recipientBlock: string[];
  greeting: string;
  subject: string;
  paragraphs: string[];
  closing: string;
  signatureBlock: string[];
  /** Placeholder labels remaining in the document (missing data). */
  placeholders: string[];
}
