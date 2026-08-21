import Link from 'next/link'
import styles from './landing.module.css'

const services = [
  { icon: 'edit_note', title: 'Write', text: 'Letters and school requests.', href: '/app/write' },
  { icon: 'search', title: 'Find', text: 'School, JAMB and admission information.', href: '/app/search' },
  { icon: 'notifications', title: 'Check', text: 'Notices, exams and deadlines.', href: '/app/updates' },
  { icon: 'calculate', title: 'Calculate', text: 'GPA, CGPA and target scores.', href: '/app/tools/gpa' },
  { icon: 'folder_open', title: 'Get', text: 'Past questions, forms and links.', href: '/app/resources' },
  { icon: 'help', title: 'Ask', text: 'Get the next useful answer.', href: '/app/ask' },
]

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>EduReach <span>Hub</span></Link>
          <nav className={styles.nav} aria-label="Primary navigation">
            <Link href="/app/school">My School</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/signup" className="btn btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>FOR NIGERIAN TERTIARY STUDENTS</div>
              <h1>School problem?<br /><span>Start here.</span></h1>
              <p>Find information, write a letter, check an update, calculate, get a resource or ask a question.</p>
              <div className={styles.actions}>
                <Link href="/signup" className="btn btn-primary">Get Started</Link>
                <Link href="/app/school" className="btn btn-ghost">My School</Link>
              </div>
            </div>
            <div className={styles.heroCard}>
              <div className={styles.heroCardTop}>
                <span className="material-symbols-rounded">school</span>
                <div><strong>EduReach Hub</strong><small>Your student front desk</small></div>
              </div>
              <div className={styles.heroQuestion}>What do you need help with?</div>
              <div className={styles.heroHint}>Start with one task.</div>
            </div>
          </div>
        </section>

        <section className={styles.services} aria-labelledby="services-title">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <div className={styles.eyebrow}>START HERE</div>
              <h2 id="services-title">What do you need?</h2>
            </div>
            <div className={styles.serviceGrid}>
              {services.map((service) => (
                <Link href={service.href} className={styles.service} key={service.title}>
                  <span className={styles.serviceIcon}><span className="material-symbols-rounded">{service.icon}</span></span>
                  <span className={styles.serviceBody}><strong>{service.title}</strong><small>{service.text}</small></span>
                  <span className="material-symbols-rounded">arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.simpleBand}>
          <div className={styles.sectionInnerBand}>
            <div><div className={styles.eyebrow}>UNICAL FIRST</div><h2>Start with your school.</h2><p>Save your school once. EduReach puts the useful information first.</p></div>
            <Link href="/app/school" className="btn btn-primary">Open My School</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div><strong>EduReach <span>Hub</span></strong><small>Practical digital support for Nigerian tertiary students.</small></div>
          <div className={styles.footerLinks}>
            <Link href="/app/search">Search</Link>
            <Link href="/app/write">Write</Link>
            <Link href="/app/tools/gpa">Calculate</Link>
            <Link href="/app/school">My School</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
