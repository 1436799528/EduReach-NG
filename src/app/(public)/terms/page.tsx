import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of use' };

const SECTIONS: [string, string][] = [
  ['What EduReach is', 'EduReach NG is an independent student-support tool: information with sources and verification labels, document templates, academic calculators and personal productivity tools.'],
  ['What EduReach is not', 'We are not JAMB, NYSC, or any university; we are not affiliated with or endorsed by them unless explicitly stated in writing. Nothing here replaces official notices from your institution. For time-sensitive matters (dates, fees, cut-offs, lists), the official source we link always wins.'],
  ['Accuracy & responsibility', 'We work hard to keep information sourced and labelled, but we cannot guarantee every item is current at the moment you read it. You are responsible for confirming critical details on official channels before you act or pay anyone.'],
  ['Letters you generate', 'Templates format what YOU write. You are responsible for the truthfulness and appropriateness of the content you submit to institutions.'],
  ['Acceptable use', 'Do not upload illegal content, malware, or materials you have no right to share. Uploaded resources are moderated; abusers are suspended. Do not attempt to access other users\u2019 data or disrupt the service.'],
  ['Accounts', 'Keep your password private. You may delete your account at any time from Settings.'],
  ['Changes', 'If these terms change materially, we will say so in-app with the updated date.']
];

export default function TermsPage() {
  return (
    <div className="container section">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem' }}>Terms of use</h1>
        <p className="muted">The short, honest version. Last updated: August 2026.</p>
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
