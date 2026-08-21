/**
 * Curated Ask Center answers (§21). Deterministic retrieval — no invented
 * institutional facts; sensitive items link to official sources.
 */

export interface Faq {
  key: string;
  question: string;
  answer: string[];
  links: { label: string; url: string }[];
  keywords: string;
}

export const FAQS: Faq[] = [
  {
    key: 'write-suspension-letter',
    question: 'How do I write a letter responding to a suspension?',
    answer: [
      'Acknowledge the sanction factually, state what has changed since, express remorse without excuses, and make a clear commitment. Keep it one page, addressed through the correct office (usually the Registrar for reinstatement appeals).',
      'Use the Reinstatement Request template in the Write Center — it structures all of this for you and leaves placeholders where you must add your specifics.'
    ],
    links: [{ label: 'Open Reinstatement Request template', url: '/write/reinstatement-request' }],
    keywords: 'suspension letter respond reinstatement appeal rusticated expelled'
  },
  {
    key: 'clearance-documents',
    question: 'What documents do I need for clearance?',
    answer: [
      'The common set: JAMB admission letter (original), JAMB result slip, O\'Level result(s), birth certificate/declaration of age, state-of-origin certificate, passport photographs, acceptance and school fee receipts, and screening acknowledgement slips.',
      'Every school and faculty differs slightly. Check your institution\'s official list — see My School or your university profile page for official links.'
    ],
    links: [
      { label: 'University directory', url: '/universities' },
      { label: 'Admission guide', url: '/admission' }
    ],
    keywords: 'clearance documents admission requirements freshers'
  },
  {
    key: 'calculate-cgpa',
    question: 'How do I calculate my CGPA?',
    answer: [
      'GPA = Σ(course units × grade points) ÷ Σ(course units) for one semester. CGPA is the same formula across all your semesters combined.',
      'On a 5.0 scale: A=5, B=4, C=3, D=2, E=1, F=0. Use the GPA Calculator and the CGPA target tool to do the arithmetic for you.'
    ],
    links: [
      { label: 'GPA Calculator', url: '/tools/gpa-calculator' },
      { label: 'Can I Still Get This CGPA?', url: '/tools/cgpa-target' }
    ],
    keywords: 'cgpa gpa calculate how computation grade point'
  },
  {
    key: 'check-jamb-result',
    question: 'How do I check my JAMB result?',
    answer: [
      'Through official JAMB channels: the eFacility portal, or the SMS shortcode JAMB announces each year, using your registered phone number.',
      'Ignore anyone offering "result upgrades" — results cannot be upgraded. That is a scam.'
    ],
    links: [{ label: 'JAMB eFacility portal', url: 'https://efacility.jamb.gov.ng' }],
    keywords: 'jamb result check utme score'
  },
  {
    key: 'jamb-caps',
    question: 'What is JAMB CAPS and how do I accept admission?',
    answer: [
      'CAPS (Central Admissions Processing System) is where schools\' admission lists are approved and where you accept or reject an offer. Log in to the eFacility portal and open CAPS.',
      '"Not Admitted" is not final — schools upload in batches. Once offered, you must ACCEPT on CAPS, then print your JAMB admission letter for clearance.'
    ],
    links: [{ label: 'JAMB eFacility portal', url: 'https://efacility.jamb.gov.ng' }],
    keywords: 'caps accept admission status jamb admission in progress'
  },
  {
    key: 'late-registration',
    question: 'I missed the course registration deadline. What do I do?',
    answer: [
      'Act immediately: contact your course adviser and HOD. Most departments allow late registration with a written appeal — sometimes with an approved penalty fee.',
      'Draft the letter with the Late Course Registration Appeal template, state your reason honestly, and attach evidence. Do not ignore it — unregistered courses can cost you the semester.'
    ],
    links: [{ label: 'Late Registration Appeal template', url: '/write/late-registration-appeal' }],
    keywords: 'late registration deadline missed course form registration appeal'
  },
  {
    key: 'change-course',
    question: 'How do I change my course or institution after JAMB?',
    answer: [
      'Two different moves: JAMB change of course/institution (through the eFacility portal, usually for a fee at accredited centres) moves you to a new school/course before admission.',
      'Changing course inside your university (intra-university transfer) is done by application through your department — requirements often include a minimum CGPA and space in the receiving department.',
      'Always confirm the subject combination and O\'Level requirements of the destination course first.'
    ],
    links: [
      { label: 'Change of Course Request template', url: '/write/change-of-course' },
      { label: 'JAMB guide', url: '/jamb' }
    ],
    keywords: 'change course institution transfer department jamb'
  },
  {
    key: 'siwes',
    question: 'What is SIWES and when do I go for it?',
    answer: [
      'SIWES (Students Industrial Work Experience Scheme) is the supervised industrial training (IT) attached to many programmes, coordinated with the ITF. Most students go in their penultimate year, but your department sets the timing.',
      'You will typically need a committal/placement letter from your school, logbook registration, and an ITF Form 8. See the SIWES request template if you need any of these letters.'
    ],
    links: [{ label: 'SIWES Request template', url: '/write/siwes-request' }],
    keywords: 'siwes it industrial training itf placement logbook'
  },
  {
    key: 'cgpa-possible',
    question: 'I have a low CGPA. Can I still graduate with a good class?',
    answer: [
      'It depends on three numbers: your current CGPA, how many credit units you have completed, and how many remain. More remaining units = more room to move your average.',
      'The "Can I Still Get This CGPA?" tool computes the exact average you need, tells you if the target is mathematically possible, and shows best/average/low scenarios.'
    ],
    links: [{ label: 'Can I Still Get This CGPA?', url: '/tools/cgpa-target' }],
    keywords: 'cgpa low improve first class second class possible target'
  },
  {
    key: 'result-carryover',
    question: 'I failed a course. What happens to my CGPA?',
    answer: [
      'A failed grade (F) contributes 0 grade points but its credit units still count in the divisor — that is why Fs drag CGPA down sharply. When you re-register and pass the course, the new grade replaces the old one in most schools\' computation (some average both attempts — check your school\'s rule).',
      'Prioritise clearing carryovers in your next semester registration; they cap how high your final classification can climb.'
    ],
    links: [{ label: 'GPA Calculator', url: '/tools/gpa-calculator' }],
    keywords: 'carryover fail f resit repeat course cgpa effect'
  }
];

export function searchFaqs(query: string): Faq[] {
  const tokens = query.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const scored = FAQS.map((f) => {
    const haystack = `${f.question} ${f.keywords} ${f.answer.join(' ')}`.toLowerCase();
    let score = 0;
    for (const t of tokens) if (haystack.includes(t)) score += t.length;
    return { f, score };
  }).filter((s) => s.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.f);
}
