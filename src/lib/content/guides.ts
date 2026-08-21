/**
 * Curated, evergreen guidance content (§10, §21).
 * Rules: no fabricated dates/figures. Anything time-sensitive links out to
 * official sources so students can verify. Keep language plain.
 */

export interface GuideSection {
  title: string;
  body: string[];
  links?: { label: string; url: string }[];
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  category: 'JAMB' | 'ADMISSION' | 'UNIVERSITY' | 'STUDENT_LIFE';
  updatedLabel: string;
  sections: GuideSection[];
}

export const JAMB_GUIDES: Guide = {
  slug: 'jamb',
  title: 'JAMB & UTME — what you need to know',
  summary: 'Registration, CAPS, results, change of course/institution, and how to verify official dates.',
  category: 'JAMB',
  updatedLabel: 'Reviewed 2026',
  sections: [
    {
      title: 'Registration for UTME / Direct Entry',
      body: [
        'JAMB registration is done online through the official eFacility portal, usually with an accredited CBT centre. You will need a valid email address, a phone number you control, and your National Identification Number (NIN).',
        'Always confirm the current registration dates and fees on the official JAMB website before paying anyone. JAMB does not sell forms through WhatsApp vendors.'
      ],
      links: [
        { label: 'JAMB official website', url: 'https://www.jamb.gov.ng' },
        { label: 'JAMB eFacility portal', url: 'https://efacility.jamb.gov.ng' }
      ]
    },
    {
      title: 'CAPS — the Central Admissions Processing System',
      body: [
        'CAPS is where admission decisions appear. "Not Admitted" is not final — lists are uploaded in batches. "Admission in Progress" means your school has recommended you.',
        'If you receive an offer on CAPS, you must ACCEPT or REJECT it on the portal. After accepting, you can print your JAMB admission letter — many schools require it during clearance.'
      ],
      links: [{ label: 'Check status on CAPS / eFacility', url: 'https://efacility.jamb.gov.ng' }]
    },
    {
      title: 'Checking your UTME result',
      body: [
        'Results are checked through official JAMB channels: the portal, or SMS using the phone number you registered with. Ignore "result upgrade" offers — they are scams.'
      ]
    },
    {
      title: 'Change of course or institution',
      body: [
        'JAMB allows candidates to change course/institution through the eFacility portal, usually for a fee, at accredited centres. Do this only after checking the requirements of the new course and school.',
        'Changing course may require a new subject combination. Verify the combination in the JAMB brochure before changing.'
      ],
      links: [{ label: 'JAMB eFacility portal', url: 'https://efacility.jamb.gov.ng' }]
    },
    {
      title: 'Dates change every year — verify',
      body: [
        'EduReach does not invent JAMB dates. Registration windows, exam dates and result release dates are announced on jamb.gov.ng and JAMB\'s official handles each year.',
        'When we publish a time-sensitive update, it will carry a source and a "last verified" date. Treat any post without those with caution.'
      ]
    }
  ]
};

export const ADMISSION_GUIDE: Guide = {
  slug: 'admission',
  title: 'Admission into Nigerian universities — the moving parts',
  summary: 'Post-UTME screening, cut-off marks, O\'Level requirements, and clearance documents.',
  category: 'ADMISSION',
  updatedLabel: 'Reviewed 2026',
  sections: [
    {
      title: 'Post-UTME / screening',
      body: [
        'After UTME, most universities run a screening — either an exam (post-UTME), a credentials screen, or both. Each school announces its own process, fee and deadline on its website and admission portal.',
        'Budget for the screening fee and apply only through the school\'s official portal. Keep printed copies of your application, payment receipt and acknowledgement slip.'
      ]
    },
    {
      title: 'Cut-off marks — what they mean',
      body: [
        'There are usually two numbers: the general UTME cut-off (the minimum your school accepts) and departmental cut-offs (what a specific course effectively requires, often much higher for competitive courses like Medicine, Law, Nursing and Engineering).',
        'Cut-offs change per session. On EduReach, every cut-off entry carries a verification label — Officially verified, Source reported, Community submitted or Needs verification — plus a "last verified" date.'
      ]
    },
    {
      title: 'O\'Level requirements',
      body: [
        'Most courses require 5 relevant credit passes (including English and usually Mathematics) in WAEC/NECO/NABTEB, at not more than two sittings. Competitive courses may require one sitting.',
        'Awaiting result? Some schools accept it at screening but you must upload the result to CAPS before admission is finalised.'
      ]
    },
    {
      title: 'Typical clearance documents (checklist)',
      body: [
        'JAMB admission letter (original), JAMB result slip, O\'Level result(s), birth certificate or declaration of age, state of origin certificate, passport photographs, acceptance/school fee receipts, and your screening documents.',
        'Requirements differ per school and faculty — always use your own school\'s clearance list. Our My School section links your institution\'s official pages.'
      ]
    }
  ]
};

export const STUDENT_LIFE_GUIDES: GuideSection[] = [
  {
    title: 'Budgeting on campus',
    body: [
      'Split money into fixed costs first: fees, rent, then food and transport. Keep an emergency float — small unplanned costs (departmental dues, printing, medical) are what usually break a student budget.',
      'Price printing and photocopies near your department, not your hostel — faculty business centres are usually cheaper.'
    ]
  },
  {
    title: 'Hostels & off-campus housing',
    body: [
      'School hostels are cheaper but competitive — apply as soon as the portal opens. When renting off-campus, inspect the room, confirm the actual landlord/caretaker, and collect a receipt for every payment.',
      'Ask about water, power and security before paying. These three affect your reading more than the room itself.'
    ]
  },
  {
    title: 'Opportunities',
    body: [
      'Watch for scholarships, bursaries (federal and state), SIWES stipends, and student work-study roles. We surface verified ones in Updates under the Opportunity category.'
    ]
  }
];

/** Tools index used by the landing page, search results and quick tools. */
export const TOOLS_DIRECTORY = [
  { key: 'gpa', title: 'GPA Calculator', description: 'Compute your semester GPA on a 5.0, 4.0 or custom scale.', url: '/tools/gpa-calculator', keywords: 'gpa grade point average calculator semester' },
  { key: 'cgpa-target', title: 'Can I Still Get This CGPA?', description: 'Check if your target CGPA is mathematically possible and what it takes.', url: '/tools/cgpa-target', keywords: 'cgpa target required gpa projection can i still' },
  { key: 'letters', title: 'Letter Generator', description: 'Generate properly formatted Nigerian academic letters in minutes.', url: '/letters', keywords: 'letter write hod dean appeal request siwes suspension' },
  { key: 'deadlines', title: 'Exam & Deadline Tracker', description: 'Track exams, tests, registrations and fees with countdowns.', url: '/deadlines', keywords: 'deadline exam countdown track reminder' },
  { key: 'updates', title: 'Verified Updates', description: 'JAMB, admission and school announcements with sources.', url: '/check', keywords: 'news updates announcements jamb admission' },
  { key: 'resources', title: 'Past Questions & Resources', description: 'Past questions, guides, forms and templates.', url: '/resources', keywords: 'past question resource material download' },
  { key: 'universities', title: 'University Directory', description: 'Verified profiles of Nigerian institutions, starting with UNICAL.', url: '/universities', keywords: 'university school unical directory cut off' },
  { key: 'ask', title: 'Ask', description: 'Practical answers about university procedures.', url: '/ask', keywords: 'ask question help how do i' }
] as const;
