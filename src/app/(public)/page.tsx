import Link from 'next/link';
import { IconPen, IconSearch, IconCheck, IconCalc, IconFolder, IconQuestion, IconArrowRight, IconShield } from '@/components/icons';

const ACTIONS = [
  { href: '/write', icon: <IconPen size={22} />, cls: 'write', title: 'Write', desc: 'Generate official academic letters — appeals, requests, explanations — properly formatted.' },
  { href: '/universities', icon: <IconSearch size={22} />, cls: 'find', title: 'Find', desc: 'University, JAMB, admission and cut-off information in one searchable place.' },
  { href: '/check', icon: <IconCheck size={22} />, cls: 'check', title: 'Check', desc: 'Deadlines, exam dates and verified school announcements.' },
  { href: '/tools/gpa-calculator', icon: <IconCalc size={22} />, cls: 'calc', title: 'Calculate', desc: 'GPA, CGPA and "can I still hit my target?" — exact math, no guesswork.' },
  { href: '/resources', icon: <IconFolder size={22} />, cls: 'get', title: 'Get', desc: 'Past questions, guides, forms and templates for your courses.' },
  { href: '/ask', icon: <IconQuestion size={22} />, cls: 'ask', title: 'Ask', desc: 'Practical answers about university procedures and student life.' }
];

const FEATURES = [
  { title: 'Write letters that get read', desc: 'Late registration appeals, result corrections, SIWES requests, leave letters and more — with proper Nigerian academic formatting.' },
  { title: 'Know your exact academic position', desc: 'Deterministic GPA/CGPA engine. Check if your target class is mathematically possible and what it requires.' },
  { title: 'Never miss a deadline again', desc: 'Track exams, tests, registrations and fee deadlines with countdowns and reminders.' },
  { title: 'Trust what you read', desc: 'Every update carries a source, a verification label and a "last verified" date. No rumours from WhatsApp groups.' }
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero__eyebrow">Built for Nigerian tertiary students</span>
          <h1>School problem? <span className="accent">Start here.</span></h1>
          <p className="hero__sub">
            Find school information. Generate official letters. Check JAMB updates.
            Calculate your GPA. Track deadlines. Get useful resources — in one place,
            without digging through WhatsApp groups and notice boards.
          </p>
          <div className="row row--wrap mt-2">
            <Link href="/register" className="btn btn--primary btn--lg">Get started — free</Link>
            <Link href="/tools" className="btn btn--outline btn--lg">Explore tools <IconArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* Six core actions */}
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <h2>What do you need help with?</h2>
          <p className="muted" style={{ maxWidth: '60ch' }}>Six things. That&apos;s the whole product. Pick one.</p>
          <div className="grid grid--3 mt-2">
            {ACTIONS.map((a) => (
              <Link key={a.title} href={a.href} className="action-tile">
                <span className={`action-tile__icon action-tile__icon--${a.cls}`}>{a.icon}</span>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust model */}
      <section className="section">
        <div className="container">
          <div className="trust-strip">
            <div className="row" style={{ gap: 14 }}>
              <IconShield size={30} />
              <h2 style={{ margin: 0 }}>Information you can actually trust</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '62ch' }}>
              Misinformation costs students money and entire semesters. Every important update on EduReach
              carries its source, a &ldquo;last verified&rdquo; date, and a plain trust label:
            </p>
            <div className="row row--wrap mt-2">
              <span className="badge badge--verified">Officially verified</span>
              <span className="badge badge--reported">Source reported</span>
              <span className="badge badge--community">Community submitted</span>
              <span className="badge badge--pending">Needs verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <h2>Made for how students actually live</h2>
          <div className="grid grid--2 mt-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card--hover">
                <h3>{f.title}</h3>
                <p className="muted" style={{ margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Launch institution */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="card card--pad-lg" style={{ borderLeft: '4px solid var(--green)' }}>
            <div className="row row--wrap spread">
              <div>
                <span className="tag">Now live</span>
                <h3 className="mt-1">University of Calabar</h3>
                <p className="muted" style={{ maxWidth: '56ch', margin: 0 }}>
                  We&apos;re going deep with one institution first — its faculties, departments, procedures,
                  cut-offs and updates — then expanding to UNILAG, LASU, UNIBEN, UNN, FUTA, ABU and more.
                </p>
              </div>
              <Link href="/universities/university-of-calabar" className="btn btn--outline">
                View UNICAL profile <IconArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Your school problems, handled faster.</h2>
          <p className="muted" style={{ maxWidth: '46ch', margin: '0 auto 20px' }}>
            Free to start. Takes less than a minute to create your account.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link href="/register" className="btn btn--primary btn--lg">Create free account</Link>
          </div>
        </div>
      </section>
    </>
  );
}
