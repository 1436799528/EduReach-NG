import type { LetterTemplate } from './types';
import { IDENTITY_FIELDS, REASON_FIELD, SESSION_FIELDS, SUPPORTING_FIELD } from './fields';

/**
 * Reusable, versioned letter templates (§42). Bodies follow Nigerian
 * academic correspondence conventions. Missing user data renders as
 * [PLACEHOLDER] — the system never fabricates names, dates, or authorities.
 */
export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    key: 'letter-hod',
    title: 'Letter to Head of Department',
    description: 'A general formal letter to your HOD for requests, reports or enquiries.',
    category: 'Departmental',
    version: '1.0',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'subjectLine', label: 'Subject of the letter', type: 'text', required: true, placeholder: 'e.g. REQUEST FOR COURSE FORM ENDORSEMENT' },
      { key: 'purpose', label: 'What are you writing about?', type: 'textarea', required: true, placeholder: 'State your request or report clearly and politely.' },
      { key: 'supportingDetails', label: 'Supporting details (optional)', type: 'textarea', required: false }
    ],
    subject: (h) => h.t('subjectLine', 'Subject'),
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, Faculty of ${h.t('faculty', 'Faculty')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      h.t('purpose', 'Purpose of the letter'),
      ...(h.raw('supportingDetails')
        ? [`For clarity, ${h.raw('supportingDetails')}`]
        : []),
      'I would be grateful if this matter receives your kind attention and favourable consideration.',
      'Thank you.'
    ]
  },
  {
    key: 'letter-dean',
    title: 'Letter to the Dean',
    description: 'A formal letter to your Faculty Dean for faculty-level matters.',
    category: 'Faculty',
    version: '1.0',
    recipientTitle: 'The Dean,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'subjectLine', label: 'Subject of the letter', type: 'text', required: true },
      { key: 'purpose', label: 'What are you writing about?', type: 'textarea', required: true },
      { key: 'supportingDetails', label: 'Supporting details (optional)', type: 'textarea', required: false }
    ],
    subject: (h) => h.t('subjectLine', 'Subject'),
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, Faculty of ${h.t('faculty', 'Faculty')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      h.t('purpose', 'Purpose of the letter'),
      ...(h.raw('supportingDetails') ? [`For clarity, ${h.raw('supportingDetails')}`] : []),
      'I respectfully request your kind consideration and approval.',
      'Thank you.'
    ]
  },
  {
    key: 'late-registration-appeal',
    title: 'Late Course Registration Appeal',
    description: 'Appeal for permission to complete course registration after the deadline.',
    category: 'Registration',
    version: '1.2',
    recipientTitle: 'The Head of Department,',
    fields: [...IDENTITY_FIELDS, ...SESSION_FIELDS, REASON_FIELD, SUPPORTING_FIELD],
    subject: () => 'APPEAL FOR LATE COURSE REGISTRATION',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, Faculty of ${h.t('faculty', 'Faculty')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully write to appeal for permission to complete my course registration for the ${h.t('semester', 'Semester')} semester of the ${h.t('session', 'Academic session')} academic session.`,
      `I was unable to complete my registration within the stipulated period due to ${h.t('reason', 'Reason')}.`,
      ...(h.raw('supportingDetails')
        ? [`In support of this appeal, ${h.raw('supportingDetails')} Relevant documents are attached where applicable.`]
        : []),
      'I take full responsibility for the delay, and I am ready to fulfil every requirement, including any approved late-registration obligations.',
      'I humbly appeal that my request be given favourable consideration so that I do not lose the semester. Thank you.'
    ]
  },
  {
    key: 'result-correction',
    title: 'Result Correction Request',
    description: 'Request a review/correction of a wrongly recorded result.',
    category: 'Results',
    version: '1.1',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      ...SESSION_FIELDS,
      { key: 'courseCode', label: 'Course code', type: 'text', required: true, placeholder: 'e.g. CSC 301' },
      { key: 'courseTitle', label: 'Course title', type: 'text', required: false },
      { key: 'recordedGrade', label: 'Grade currently recorded', type: 'text', required: true, placeholder: 'e.g. F or "no result"' },
      { key: 'expectedOutcome', label: 'What you believe is correct', type: 'textarea', required: true, placeholder: 'e.g. I sat for the exam and my score should reflect my script...' },
      SUPPORTING_FIELD
    ],
    subject: (h) => `REQUEST FOR CORRECTION OF RESULT — ${h.t('courseCode', 'Course code')}`,
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I write respectfully concerning my result for ${h.raw('courseCode')}${h.raw('courseTitle') ? ` (${h.raw('courseTitle')})` : ''} in the ${h.t('semester', 'Semester')} semester of the ${h.t('session', 'Academic session')} session, which was recorded as ${h.t('recordedGrade', 'Recorded grade')}.`,
      h.t('expectedOutcome', 'Explanation'),
      ...(h.raw('supportingDetails') ? [`In support, ${h.raw('supportingDetails')}`] : []),
      'I respectfully request that the department kindly reviews my script and records, and effects the appropriate correction.',
      'Thank you for your time and consideration.'
    ]
  },
  {
    key: 'course-registration-request',
    title: 'Course Registration Request',
    description: 'Request approval to register, add or drop a course.',
    category: 'Registration',
    version: '1.0',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      ...SESSION_FIELDS,
      { key: 'courseCode', label: 'Course code', type: 'text', required: true },
      { key: 'requestType', label: 'Request type', type: 'select', required: true, options: [
        { value: 'register for', label: 'Register for this course' },
        { value: 'add', label: 'Add this course' },
        { value: 'drop', label: 'Drop this course' }
      ] },
      REASON_FIELD
    ],
    subject: (h) => `REQUEST TO ${h.raw('requestType') ? h.raw('requestType').toUpperCase() : 'REGISTER'} ${h.t('courseCode', 'Course code')}`,
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully request approval to ${h.raw('requestType') || '[ACTION]'} ${h.t('courseCode', 'Course code')} in the ${h.t('semester', 'Semester')} semester of the ${h.t('session', 'Academic session')} session.`,
      `This request is because ${h.t('reason', 'Reason')}.`,
      'I would be grateful for your kind approval. Thank you.'
    ]
  },
  {
    key: 'absence-explanation',
    title: 'Explanation for Absence',
    description: 'Explain an absence from lectures, tests or departmental activities.',
    category: 'Departmental',
    version: '1.0',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'absencePeriod', label: 'Period of absence', type: 'text', required: true, placeholder: 'e.g. 12th – 16th May 2026' },
      REASON_FIELD,
      SUPPORTING_FIELD
    ],
    subject: () => 'EXPLANATION FOR ABSENCE',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully write to explain my absence from academic activities between ${h.t('absencePeriod', 'Period of absence')}.`,
      `The absence was due to ${h.t('reason', 'Reason')}.`,
      ...(h.raw('supportingDetails') ? [`As evidence, ${h.raw('supportingDetails')} Supporting documents are attached.`] : []),
      'I regret any inconvenience this may have caused and I have taken steps to cover the work I missed.',
      'Thank you for your understanding.'
    ]
  },
  {
    key: 'medical-absence',
    title: 'Medical Absence Explanation',
    description: 'Explain an absence on medical grounds (attach medical reports).',
    category: 'Departmental',
    version: '1.0',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'absencePeriod', label: 'Period of absence', type: 'text', required: true, placeholder: 'e.g. 3rd – 21st June 2026' },
      { key: 'missedItems', label: 'What you missed (optional)', type: 'text', required: false, placeholder: 'e.g. lectures and the CSC 301 test' },
      { key: 'medicalNote', label: 'Brief note on the situation', type: 'textarea', required: true, placeholder: 'State what you are comfortable sharing. Attach official medical documents.' }
    ],
    subject: () => 'EXPLANATION FOR ABSENCE ON MEDICAL GROUNDS',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully write to explain my absence from ${h.raw('missedItems') || 'academic activities'} between ${h.t('absencePeriod', 'Period of absence')} on medical grounds.`,
      h.t('medicalNote', 'Brief explanation'),
      'A medical report from the attending physician is attached for your records.',
      'I kindly request that my absence be excused, and where applicable, that I be considered for any approved make-up arrangements.',
      'Thank you for your understanding and support.'
    ]
  },
  {
    key: 'exam-explanation',
    title: 'Missed Examination Explanation',
    description: 'Explain why you missed an examination and request consideration.',
    category: 'Examinations',
    version: '1.0',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'courseCode', label: 'Course code', type: 'text', required: true },
      { key: 'examDate', label: 'Examination date', type: 'text', required: true, placeholder: 'e.g. Tuesday, 14th July 2026' },
      REASON_FIELD,
      SUPPORTING_FIELD
    ],
    subject: (h) => `EXPLANATION FOR MISSING ${h.t('courseCode', 'Course code')} EXAMINATION`,
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully write to explain why I was unable to sit for the ${h.t('courseCode', 'Course code')} examination held on ${h.t('examDate', 'Examination date')}.`,
      `On that day, ${h.t('reason', 'Reason')}.`,
      ...(h.raw('supportingDetails') ? [`In support of this explanation, ${h.raw('supportingDetails')}`] : []),
      'I humbly request that my case be considered under the regulations governing missed examinations, including any approved make-up examination.',
      'Thank you for your kind consideration.'
    ]
  },
  {
    key: 'siwes-request',
    title: 'SIWES / Industrial Training Request',
    description: 'Request SIWES approval, placement support or committal letter.',
    category: 'SIWES',
    version: '1.0',
    recipientTitle: 'The SIWES Coordinator,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'requestType', label: 'What do you need?', type: 'select', required: true, options: [
        { value: 'approval to commence my industrial training', label: 'Approval to commence IT' },
        { value: 'a placement/committal letter', label: 'Placement / committal letter' },
        { value: 'approval to change my IT placement', label: 'Change of IT placement' }
      ] },
      { key: 'company', label: 'Company / organisation (optional)', type: 'text', required: false, placeholder: 'e.g. Kaduna Refining & Petrochemical Company' },
      { key: 'itPeriod', label: 'IT period', type: 'text', required: true, placeholder: 'e.g. June – December 2026' },
      { key: 'extraDetails', label: 'Extra details (optional)', type: 'textarea', required: false }
    ],
    subject: () => 'REQUEST FOR SIWES / INDUSTRIAL TRAINING APPROVAL',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, Faculty of ${h.t('faculty', 'Faculty')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully request ${h.t('requestType', 'Request')} for my industrial training scheduled for ${h.t('itPeriod', 'IT period')}${h.raw('company') ? ` at ${h.raw('company')}` : ''}.`,
      ...(h.raw('extraDetails') ? [h.raw('extraDetails')] : []),
      'I would be grateful for the necessary approval and documentation to proceed.',
      'Thank you.'
    ]
  },
  {
    key: 'change-of-course',
    title: 'Change of Course Request',
    description: 'Apply to change your course/programme within the institution.',
    category: 'Departmental',
    version: '1.0',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'desiredCourse', label: 'Course you want to change to', type: 'text', required: true, placeholder: 'e.g. Computer Science' },
      { key: 'currentCgpa', label: 'Current CGPA (optional)', type: 'text', required: false },
      REASON_FIELD
    ],
    subject: (h) => `APPLICATION FOR CHANGE OF COURSE TO ${h.t('desiredCourse', 'Desired course')}`,
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, currently a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully apply for a change of course from ${h.t('department', 'Current department')} to ${h.t('desiredCourse', 'Desired course')}${h.raw('currentCgpa') ? `. My current CGPA is ${h.raw('currentCgpa')}` : ''}.`,
      `My reasons are as follows: ${h.t('reason', 'Reason')}.`,
      'I understand this application is subject to the regulations and availability of space in the receiving department, and I am ready to meet every requirement.',
      'Thank you for considering my application.'
    ]
  },
  {
    key: 'leave-request',
    title: 'Leave of Absence Request',
    description: 'Request official leave from academic activities for a period.',
    category: 'Departmental',
    version: '1.0',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'leavePeriod', label: 'Leave period', type: 'text', required: true, placeholder: 'e.g. 1st September – 30th November 2026' },
      REASON_FIELD,
      SUPPORTING_FIELD
    ],
    subject: () => 'REQUEST FOR LEAVE OF ABSENCE',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully request a leave of absence from academic activities for the period ${h.t('leavePeriod', 'Leave period')}.`,
      `This request is necessitated by ${h.t('reason', 'Reason')}.`,
      ...(h.raw('supportingDetails') ? [`In support, ${h.raw('supportingDetails')}`] : []),
      'I undertake to resume promptly and fulfil all outstanding academic obligations on my return.',
      'I would be grateful for your kind approval. Thank you.'
    ]
  },
  {
    key: 'reinstatement-request',
    title: 'Reinstatement Request',
    description: 'Request reinstatement after suspension or withdrawal.',
    category: 'Appeals',
    version: '1.0',
    recipientTitle: 'The Registrar,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'sanctionDetails', label: 'The sanction and when it took effect', type: 'textarea', required: true, placeholder: 'e.g. I was suspended for one session effective February 2025 for...' },
      { key: 'remorseAndPlan', label: 'What has changed / your commitment', type: 'textarea', required: true }
    ],
    subject: () => 'APPEAL FOR REINSTATEMENT',
    greeting: 'Dear Sir,',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a student of the Department of ${h.t('department', 'Department')}, Faculty of ${h.t('faculty', 'Faculty')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      h.t('sanctionDetails', 'Sanction details'),
      `Since then, ${h.t('remorseAndPlan', 'Your commitment')}.`,
      'I sincerely regret the circumstances that led to this sanction, and I humbly appeal for reinstatement to continue my studies. I undertake to abide fully by the rules and regulations of the institution.',
      'I would be most grateful for a compassionate consideration of my appeal. Thank you.'
    ]
  },
  {
    key: 'recommendation-request',
    title: 'Recommendation Letter Request',
    description: 'Politely ask a lecturer or supervisor for a recommendation.',
    category: 'Requests',
    version: '1.0',
    recipientTitle: '[LECTURER NAME/TITLE],',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'purpose', label: 'Purpose of the recommendation', type: 'text', required: true, placeholder: 'e.g. scholarship application, postgraduate admission, NYSC relocation' },
      { key: 'relationship', label: 'Your relationship to the lecturer', type: 'text', required: true, placeholder: 'e.g. you taught me CSC 201 and supervised my project' },
      { key: 'deadline', label: 'Submission deadline (optional)', type: 'text', required: false }
    ],
    subject: () => 'REQUEST FOR A LETTER OF RECOMMENDATION',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully write to request a letter of recommendation for ${h.t('purpose', 'Purpose')}. ${h.raw('relationship') ? `You may recall that ${h.raw('relationship')}.` : ''}`,
      ...(h.raw('deadline') ? [`The letter is required by ${h.raw('deadline')}. I would sincerely appreciate your support.`] : ['I would sincerely appreciate your support.']),
      'I am happy to provide my transcript, CV or any other information you may require.',
      'Thank you very much for your time and mentorship.'
    ]
  },
  {
    key: 'fee-payment-appeal',
    title: 'School Fee Payment Appeal',
    description: 'Appeal for instalment payment or an extension on school fees.',
    category: 'Fees',
    version: '1.0',
    recipientTitle: 'The Dean,',
    fields: [
      ...IDENTITY_FIELDS,
      ...SESSION_FIELDS,
      { key: 'requestType', label: 'What are you asking for?', type: 'select', required: true, options: [
        { value: 'an extension of time to pay my school fees', label: 'Extension of payment deadline' },
        { value: 'permission to pay my school fees in instalments', label: 'Pay in instalments' }
      ] },
      { key: 'amountPaid', label: 'Amount already paid (optional)', type: 'text', required: false, placeholder: 'e.g. ₦45,000 of ₦95,000' },
      REASON_FIELD
    ],
    subject: () => 'APPEAL REGARDING SCHOOL FEE PAYMENT',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully write to appeal for ${h.t('requestType', 'Request')} for the ${h.t('session', 'Academic session')} academic session${h.raw('amountPaid') ? `. I have so far paid ${h.raw('amountPaid')}` : ''}.`,
      `My current financial difficulty is due to ${h.t('reason', 'Reason')}.`,
      'I remain fully committed to settling the balance and I am willing to provide any required undertaking or documentation.',
      'I humbly request your kind consideration so that I can continue my registration and examinations without interruption. Thank you.'
    ]
  },
  {
    key: 'project-extension',
    title: 'Project Extension Request',
    description: 'Request more time to complete or submit your final-year project.',
    category: 'Project',
    version: '1.0',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'supervisor', label: 'Supervisor name (optional)', type: 'text', required: false },
      { key: 'projectTitle', label: 'Project title', type: 'text', required: true },
      { key: 'requestedPeriod', label: 'Extension period requested', type: 'text', required: true, placeholder: 'e.g. four weeks, until 30th September 2026' },
      REASON_FIELD
    ],
    subject: () => 'REQUEST FOR EXTENSION OF PROJECT SUBMISSION DEADLINE',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I am currently working on my final-year project titled "${h.t('projectTitle', 'Project title')}"${h.raw('supervisor') ? ` under the supervision of ${h.raw('supervisor')}` : ''}.`,
      `I respectfully request an extension of ${h.t('requestedPeriod', 'Extension period')} because ${h.t('reason', 'Reason')}.`,
      'I have made substantial progress and I am committed to completing the project within the requested period.',
      'Thank you for your kind consideration.'
    ]
  },
  {
    key: 'general-complaint',
    title: 'General Academic Complaint',
    description: 'Raise an academic issue formally with evidence and requested remedy.',
    category: 'Complaints',
    version: '1.0',
    recipientTitle: 'The Head of Department,',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'issue', label: 'The issue', type: 'textarea', required: true, placeholder: 'Describe the issue factually: what happened, where, and when.' },
      { key: 'impact', label: 'How it affects you', type: 'textarea', required: true },
      { key: 'remedy', label: 'The remedy you are requesting', type: 'textarea', required: true }
    ],
    subject: () => 'FORMAL ACADEMIC COMPLAINT',
    paragraphs: (h) => [
      `I am ${h.t('fullName', 'Full name')}, a ${h.raw('level') ? `${h.raw('level')}-level` : '[LEVEL]-level'} student of the Department of ${h.t('department', 'Department')}, with matriculation number ${h.t('matricNumber', 'Matric number')}.`,
      `I respectfully bring the following matter to your attention: ${h.t('issue', 'Issue')}.`,
      `This situation affects me in the following way: ${h.t('impact', 'Impact')}.`,
      `I therefore respectfully request that ${h.t('remedy', 'Requested remedy')}.`,
      'I am available to provide further information or evidence if required. Thank you for your attention to this matter.'
    ]
  },
  {
    key: 'custom-formal',
    title: 'Custom Formal Letter',
    description: 'A blank formal letter layout — you control the subject and body.',
    category: 'General',
    version: '1.0',
    recipientTitle: '[RECIPIENT TITLE/OFFICE],',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'subjectLine', label: 'Subject', type: 'text', required: true },
      { key: 'body', label: 'Letter body', type: 'textarea', required: true, placeholder: 'Write each paragraph on its own line. Keep it clear, polite and factual.' }
    ],
    subject: (h) => h.t('subjectLine', 'Subject'),
    paragraphs: (h) => h.raw('body') ? h.raw('body').split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean) : ['[Letter body]']
  }
];

export function getTemplate(key: string): LetterTemplate | undefined {
  return LETTER_TEMPLATES.find((t) => t.key === key);
}

export const LETTER_CATEGORIES = Array.from(new Set(LETTER_TEMPLATES.map((t) => t.category)));
