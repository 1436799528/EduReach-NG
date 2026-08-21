import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy policy' };

const SECTIONS: [string, string][] = [
  ['What we collect', 'Account basics (name, email, optional phone), your academic profile (institution, faculty, department, level, programme, optional CGPA), the deadlines/tasks/documents you create, and resources you upload. We also keep security and audit logs (logins, administrative actions) without storing sensitive content in them.'],
  ['Why we collect it', 'To personalise your dashboard to your institution, pre-fill letter templates, remind you about deadlines you set, deliver updates for your school, and keep the platform secure. That is the whole list.'],
  ['What we never do', 'We never sell your personal data. We never expose your matric number, phone number, email or private documents in public search or public pages. We never invent institutional facts and attach them to your name.'],
  ['Your documents', 'Letters you generate are stored privately against your account only, visible to you alone, and you can delete any of them at any time.'],
  ['Your controls', 'From Settings you can view and edit your profile, export a full JSON copy of your data, and delete your account. Deletion removes your personal information (name, email, phone, academic profile) from active records; security/audit logs may retain anonymised references where integrity requires it.'],
  ['Data we keep minimal', 'Onboarding is intentionally short and everything non-essential is optional or skippable. Analytics, when added, will be product-usage events (e.g. "a GPA was calculated") — not personal surveillance.'],
  ['Contact', 'Questions about your data: privacy@edureach.ng (replace with a live mailbox before production launch).']
];

export default function PrivacyPage() {
  return (
    <div className="container section">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem' }}>Privacy policy</h1>
        <p className="muted">Plain-language version. Last updated: August 2026.</p>
        {SECTIONS.map(([h, b]) => (
          <section key={h} className="mb-2">
            <h2 style={{ fontSize: '1.15rem' }}>{h}</h2>
            <p className="muted">{b}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
