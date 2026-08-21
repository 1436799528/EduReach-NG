import Link from 'next/link';

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="logo" aria-label="EduReach NG home">
      <span className="logo__mark" aria-hidden="true">ER</span>
      <span>EduReach<span className="logo__sub">&nbsp;NG</span></span>
    </Link>
  );
}

export function PublicHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <nav aria-label="Main">
          <Link href="/tools">Tools</Link>
          <Link href="/letters">Letters</Link>
          <Link href="/jamb">JAMB</Link>
          <Link href="/admission">Admission</Link>
          <Link href="/universities">Universities</Link>
        </nav>
        <div className="row hide-mobile" style={{ marginLeft: 8 }}>
          <Link href="/login" className="btn btn--ghost">Log in</Link>
          <Link href="/register" className="btn btn--primary">Get started</Link>
        </div>
        <div className="row hide-desktop" style={{ marginLeft: 'auto' }}>
          <Link href="/login" className="btn btn--outline btn--sm">Log in</Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <Logo />
            <p className="small muted mt-1" style={{ maxWidth: '38ch' }}>
              A digital front desk for Nigerian tertiary students. Find information, generate letters,
              calculate your GPA, and track what matters.
            </p>
          </div>
          <div>
            <h4>Tools</h4>
            <Link href="/tools/gpa-calculator">GPA Calculator</Link>
            <Link href="/tools/cgpa-target">CGPA Target</Link>
            <Link href="/letters">Letter Generator</Link>
            <Link href="/deadlines">Deadline Tracker</Link>
          </div>
          <div>
            <h4>Information</h4>
            <Link href="/jamb">JAMB &amp; UTME</Link>
            <Link href="/admission">Admission guide</Link>
            <Link href="/universities">Universities</Link>
            <Link href="/ask">Ask Center</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms of use</Link>
          </div>
        </div>
        <div className="disclaimer mt-3">
          EduReach is an independent student-support service. It is <strong>not affiliated with, endorsed by,
          or officially connected to JAMB, NYSC, or any university</strong> unless explicitly stated. Always confirm
          time-sensitive information (dates, fees, cut-offs) on official institutional sources, which we link wherever possible.
        </div>
        <p className="small muted mt-2">© {new Date().getFullYear()} EduReach NG. Built for Nigerian students.</p>
      </div>
    </footer>
  );
}
