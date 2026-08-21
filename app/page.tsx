import Link from 'next/link'

const services = [
  { icon: 'edit_note', title: 'Write', text: 'Letters, appeals and school requests.', href: '/app/write' },
  { icon: 'search', title: 'Find', text: 'School, JAMB and admission information.', href: '/app/search' },
  { icon: 'notifications', title: 'Check', text: 'Notices, exams and deadlines.', href: '/app/updates' },
  { icon: 'calculate', title: 'Calculate', text: 'GPA, CGPA and target scores.', href: '/app/tools/gpa' },
  { icon: 'folder_open', title: 'Get', text: 'Past questions, forms and useful links.', href: '/app/resources' },
  { icon: 'help', title: 'Ask', text: 'Get the next useful answer to a school problem.', href: '/app/ask' },
]

const studentNeeds = [
  'JAMB & CAPS', 'Post-UTME', 'Course registration', 'HOD / Dean letters',
  'SIWES', 'School fees', 'Examinations', 'Clearance',
]

const quickLinks = [
  { icon: 'menu_book', title: 'Course Finder', text: 'Find a course fast', href: '/app/courses' },
  { icon: 'account_tree', title: 'Academic Catalogue', text: 'Faculty to course', href: '/app/school/academics' },
  { icon: 'calculate', title: 'GPA Calculator', text: 'Calculate only', href: '/app/tools/gpa' },
  { icon: 'edit_note', title: 'Write a Letter', text: 'HOD, Dean, SIWES', href: '/app/write' },
]

export default function Home() {
  return <>
    <header className="topbar">
      <div className="container nav">
        <Link href="/" className="logo">EduReach <span>Hub</span></Link>
        <nav className="navlinks">
          <Link href="/app/tools/gpa">Calculators</Link>
          <Link href="/app/school">My School</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/signup" className="btn btn-primary">Get Started</Link>
        </nav>
      </div>
    </header>

    <main>
      <section style={{ background: 'var(--bg-light)', padding: '58px 0 34px' }}>
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'stretch', gap: 18 }}>
            <div className="card-service-container" style={{ maxWidth: 'none', padding: '34px 30px', position: 'relative', overflow: 'hidden' }}>
              <div className="eyebrow">FOR NIGERIAN TERTIARY STUDENTS</div>
              <h1 style={{ fontSize: 'clamp(40px,6vw,66px)', maxWidth: 700, marginBottom: 12 }}>School problem?<br /><span style={{ color: 'var(--secondary-orange)' }}>Start here.</span></h1>
              <p style={{ maxWidth: 680, color: 'var(--text-muted)', fontSize: 17, margin: 0 }}>Letters, school information, JAMB updates, calculations and practical student help — in one place.</p>
              <div className="actions" style={{ marginTop: 24 }}>
                <Link href="/signup" className="btn btn-primary"><span className="material-symbols-rounded">arrow_forward</span>Get Started</Link>
                <Link href="/app/school" className="btn btn-navy-pill"><span className="material-symbols-rounded icon-sm">school</span>My School</Link>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
                <span className="badge good"><span className="material-symbols-rounded icon-sm">verified</span>Verified sources</span>
                <span className="badge"><span className="material-symbols-rounded icon-sm">phone_iphone</span>Mobile first</span>
                <span className="badge"><span className="material-symbols-rounded icon-sm">location_on</span>Nigerian first</span>
              </div>
              <div aria-hidden="true" style={{ position: 'absolute', width: 170, height: 170, borderRadius: '50%', right: -70, bottom: -80, background: 'rgba(232,100,12,.10)' }} />
            </div>

            <div className="card-feature" style={{ minHeight: 260, alignItems: 'flex-start', flexDirection: 'column', justifyContent: 'space-between', padding: 24, background: 'var(--primary-navy)' }}>
              <div>
                <div className="eyebrow" style={{ color: '#FFB17D' }}>STUDENT PULSE</div>
                <h2 style={{ color: '#fff', fontSize: 28, margin: '8px 0 10px' }}>Useful before clever.</h2>
                <p className="card-feature-subtitle" style={{ fontSize: 14, lineHeight: 1.65, maxWidth: 420 }}>Built for the things students actually need to get done.</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="btn-navy-pill" style={{ background: 'rgba(255,255,255,.12)' }}>JAMB</span>
                <span className="btn-navy-pill" style={{ background: 'rgba(255,255,255,.12)' }}>SIWES</span>
                <span className="btn-navy-pill" style={{ background: 'rgba(255,255,255,.12)' }}>Exams</span>
                <span className="btn-navy-pill" style={{ background: 'rgba(255,255,255,.12)' }}>Letters</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff', paddingTop: 28 }}>
        <div className="container">
          <div className="page-head">
            <div><div className="eyebrow">START HERE</div><h2 style={{ margin: '5px 0 0', color: 'var(--primary-navy)', fontSize: 30 }}>What do you need?</h2></div>
            <span className="text-handwritten" style={{ color: 'var(--secondary-orange)', fontSize: 30 }}>No stress.</span>
          </div>
          <div style={{ display: 'flex', overflowX: 'auto', gap: 12, paddingBottom: 8, scrollbarWidth: 'none' }}>
            {services.map(service => <Link key={service.title} href={service.href} className="service-card-container" style={{ minWidth: 220, flex: '0 0 220px', padding: 18, boxShadow: '0 8px 22px rgba(10,34,92,.055)' }}>
              <div className="service-icon-badge"><span className="material-symbols-rounded">{service.icon}</span></div>
              <h3 className="service-title" style={{ marginTop: 13 }}>{service.title}</h3>
              <p className="service-description">{service.text}</p>
              <span className="material-symbols-rounded" style={{ color: 'var(--secondary-orange)', marginTop: 15 }}>arrow_forward</span>
            </Link>)}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-light)', paddingTop: 34 }}>
        <div className="container">
          <div className="page-head">
            <div><div className="eyebrow">REAL STUDENT LIFE</div><h2 style={{ margin: '5px 0 0', color: 'var(--primary-navy)', fontSize: 28 }}>The things you actually deal with.</h2></div>
          </div>
          <div style={{ display: 'flex', overflowX: 'auto', gap: 10, paddingBottom: 8 }}>
            {studentNeeds.map((item, i) => <div key={item} className="card" style={{ minWidth: 165, flex: '0 0 165px', padding: 16, boxShadow: 'none' }}>
              <div className="service-icon-badge" style={{ width: 36, height: 36, background: i % 2 === 0 ? 'var(--primary-navy)' : 'var(--secondary-orange)' }}><span className="material-symbols-rounded icon-md">task_alt</span></div>
              <div style={{ marginTop: 12, fontFamily: 'var(--font-primary)', fontWeight: 800, color: 'var(--primary-navy)', fontSize: 13 }}>{item}</div>
            </div>)}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="page-head">
            <div><div className="eyebrow">USEFUL RIGHT NOW</div><h2 style={{ margin: '5px 0 0', color: 'var(--primary-navy)', fontSize: 28 }}>Jump straight into a tool.</h2></div>
            <Link href="/app/search" className="btn btn-ghost">Explore</Link>
          </div>
          <div style={{ display: 'flex', overflowX: 'auto', gap: 12, paddingBottom: 8 }}>
            {quickLinks.map(link => <Link key={link.title} href={link.href} className="card" style={{ minWidth: 240, flex: '0 0 240px', display: 'flex', alignItems: 'center', gap: 13, padding: 18 }}>
              <span className="service-icon-badge" style={{ background: 'var(--primary-navy)' }}><span className="material-symbols-rounded">{link.icon}</span></span>
              <span style={{ display: 'grid', gap: 3 }}><strong style={{ fontFamily: 'var(--font-primary)', color: 'var(--primary-navy)' }}>{link.title}</strong><small className="muted">{link.text}</small></span>
            </Link>)}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-light)' }}>
        <div className="container grid grid-2" style={{ alignItems: 'stretch' }}>
          <div className="card">
            <div className="eyebrow">TRUST MATTERS</div>
            <h2 style={{ color: 'var(--primary-navy)', fontSize: 28, margin: '7px 0 12px' }}>See where the information came from.</h2>
            <p className="muted" style={{ marginTop: 0, lineHeight: 1.7 }}>Important school information shows its source and verification status. EduReach does not invent cut-off marks, fees, deadlines or admission requirements.</p>
            <Link href="/app/updates" className="btn btn-secondary" style={{ marginTop: 6 }}><span className="material-symbols-rounded">verified</span>Verified updates</Link>
          </div>
          <div className="card" style={{ background: 'var(--primary-navy)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div className="eyebrow" style={{ color: '#FFB17D' }}>UNICAL FIRST</div>
            <h2 style={{ color: '#fff', fontSize: 28, margin: '7px 0 12px' }}>Start with your school.</h2>
            <p style={{ color: '#DDE7FF', lineHeight: 1.7, marginTop: 0 }}>Pick your institution and let EduReach put the useful information first.</p>
            <Link href="/app/school" className="btn" style={{ background: '#fff', color: 'var(--primary-navy)', marginTop: 6 }}><span className="material-symbols-rounded">school</span>My School</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#fff' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div><div className="eyebrow">START WITH ONE PROBLEM</div><h2 style={{ margin: '6px 0 0', color: 'var(--primary-navy)', fontSize: 30 }}>Let EduReach help you get it done.</h2></div>
          <Link href="/signup" className="btn btn-primary"><span className="material-symbols-rounded">person_add</span>Create free account</Link>
        </div>
      </section>
    </main>

    <footer className="footer">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
        <span>EduReach Hub — practical support for Nigerian tertiary students.</span>
        <span>Independent service. Confirm high-stakes information with the official source.</span>
      </div>
    </footer>
  </>
}
