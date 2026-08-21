import type { FieldDef } from './types';

/** Shared identity fields used by most Nigerian academic letters. */
export const IDENTITY_FIELDS: FieldDef[] = [
  { key: 'fullName', label: 'Full name', type: 'text', required: true, placeholder: 'e.g. Adaeze Okafor' },
  { key: 'matricNumber', label: 'Matric number', type: 'text', required: false, placeholder: 'e.g. 21/0457' },
  { key: 'department', label: 'Department', type: 'text', required: true, placeholder: 'e.g. Computer Science' },
  { key: 'faculty', label: 'Faculty', type: 'text', required: true, placeholder: 'e.g. Physical Sciences' },
  { key: 'level', label: 'Level', type: 'select', required: true, options: [
    { value: '100', label: '100 level' },
    { value: '200', label: '200 level' },
    { value: '300', label: '300 level' },
    { value: '400', label: '400 level' },
    { value: '500', label: '500 level' },
    { value: '600', label: '600 level' }
  ] },
  { key: 'institution', label: 'Institution', type: 'text', required: true, placeholder: 'e.g. University of Calabar' },
  { key: 'date', label: 'Date', type: 'date', required: true }
];

/** Session fields common to appeals/requests. */
export const SESSION_FIELDS: FieldDef[] = [
  { key: 'session', label: 'Academic session', type: 'text', required: true, placeholder: 'e.g. 2025/2026' },
  { key: 'semester', label: 'Semester', type: 'select', required: true, options: [
    { value: 'First', label: 'First semester' },
    { value: 'Second', label: 'Second semester' }
  ] }
];

export const REASON_FIELD: FieldDef = {
  key: 'reason',
  label: 'Reason / explanation',
  type: 'textarea',
  required: true,
  placeholder: 'Explain briefly, honestly and respectfully.'
};

export const SUPPORTING_FIELD: FieldDef = {
  key: 'supportingDetails',
  label: 'Supporting details (optional)',
  type: 'textarea',
  required: false,
  placeholder: 'Any documents or evidence you can attach.'
};
