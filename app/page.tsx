import Link from 'next/link'
import styles from './landing.module.css'

const services = [
  { icon: 'edit_note', title: 'Write', text: 'Letters, appeals and school requests.', href: '/app/write' },
  { icon: 'search', title: 'Find', text: 'School, JAMB and admission information.', href: '/app/search' },
  { icon: 'notifications', title: 'Check', text: 'Notices, exams and deadlines.', href: '/app/updates' },
  { icon: 'calculate', title: 'Calculate', text: 'GPA, CGPA and target scores.', href: '/app/tools/gpa' },
  { icon: 'folder_open', title: 'Get', text: 'Past questions, forms and useful links.', href: '/app/resources' },
  { icon: 'help', title: 'Ask', text: 'Get the next useful answer to a school problem.', href: '/app/ask' },
]

const studentNeeds = [
  ['school', 'JAMB & CAPS'],
  ['assignment', 'Post-UTME'],
  ['fact_check', 'Course registration'],
  ['edit_document', 'HOD / Dean letters'],
  ['engineering', 'SIWES'],
  ['payments', 'School fees'],
  ['event', 'Examinations'],
  ['verified', 'Clearance'],
]

const quickLinks = [
  { icon: 'menu_book', title: 'Course Finder', text: 'Find a course fast', href: '/app/courses' },
  { icon: 'account_tree', title: 'Academic Catalogue', text: 'Faculty to course', href: '/app/school/academics' },
  { icon: 'calculate', title: 'GPA Calculator', text: 'Calculate only', href: '/app/tools/gpa' },
  { icon: 'edit_note', title: 'Write a Letter', text: 'HOD, Dean, SIWES', href: '/app/write' },
]

const officialLinks = [
  { title: 'JAMB', text: 'Admissions and UTME information', href: 'https://www.jamb.gov.ng/' },
  { title: 'NELFUND', text: 'Student loan information', href: 'https://nelf.gov.ng/' },
  { title: 'FME TVET', text: 'Technical and vocational skills', href: 'https://www.tvet.education.gov.ng/' },
]

const faqs = [
  ['Is EduReach an official university portal?', 'No. EduReach is an independent student-support platform. High-stakes information should always show and link to its source.'],
  ['Can I write a letter here?', 'Yes. Choose a document type, fill the required details and generate a structured letter.'],
  ['Can I calculate my CGPA?', 'Yes. Use the deterministic academic calculator. The dashboard itself does not display CGPA.'],
  ['Which school is supported first?', 'University of Calabar is the first deep institutional rollout, with architecture ready for other Nigerian institutions.'],
]

export default function Home() {
  return <div className={styles.landing}>
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>EduReach <span>Hub</span></Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          <div className={styles.navGroup}>
            <Link className={styles.navLink} href="/app/write">Services <span className="material-symbols-rounded icon-sm">expand_more</span></Link>
            <Link className={styles.navLink} href="/app/search">Information <span className="material-symbols-rounded icon-sm">expand_more</span></Link>
            <Link className={styles.navLink} href="/app/tools/gpa">Tools</Link>
            <Link className={styles.navLink} href="/app/school">My School</Link>
          </div>
          <div className={styles.navActions}>
            <Link href="/login" className="btn btn-ghost">Sign in</Link>
            <Link href="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </nav>
      </div>
    </header>

    <main>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>FOR NIGERIAN TERTIARY STUDENTS</div>
            <h1 className={styles.heroTitle}>School problem?<br /><span>Start here.</span></h1>
            <p className={styles.heroText}>Find the information, letter, calculation, resource or next step you need — without moving through ten different school groups and websites.</p>
            <div className={styles.heroActions}>
              <Link href="/signup" className="btn btn-primary"><span className="material-symbols-rounded">arrow_forward</span>Get Started</Link>
              <Link href="/app/school" className="btn btn-navy-pill"><span className="material-symbols-rounded icon-sm">school</span>My School</Link>
            </div>
            <div className={styles.trustRow}>
              <span className="badge good"><span className="material-symbols-rounded icon-sm">verified</span>Verified sources</span>
              <span className="badge"><span className="material-symbols-rounded icon-sm">phone_iphone</span>Mobile first</span>
              <span className="badge"><span className="material-symbols-rounded icon-sm">location_on</span>Nigerian first</span>
            </div>
          </div>

          <div className={styles.heroVisual} aria-label="EduReach student service preview">
            <div className={styles.visualPanel}>
              <div className={styles.visualTop}>
                <div className={styles.visualTopLeft}>
                  <div className={styles.visualLogoDot}><span className="material-symbols-rounded">school</span></div>
                  <div className={styles.visualTopText}><strong>EduReach student desk</strong><span>University of Calabar</span></div>
                </div>
                <span className={styles.visualBadge}>READY</span>
              </div>
              <div className={styles.visualQuestion}>
                <small>Start with a problem</small>
                <strong>“I missed course registration. What should I do?”</strong>
              </div>
              <div className={styles.visualTiles}>
                <div className={styles.visualTile}><span className={styles.icon}><span className="material-symbols-rounded">edit_note</span></span><div><strong>Write</strong><span>Appeal letter</span></div></div>
                <div className={styles.visualTile}><span className={styles.icon}><span className="material-symbols-rounded">search</span></span><div><strong>Find</strong><span>School notice</span></div></div>
                <div className={styles.visualTile}><span className={styles.icon}><span className="material-symbols-rounded">event</span></span><div><strong>Check</strong><span>Deadline</span></div></div>
                <div className={styles.visualTile}><span className={styles.icon}><span className="material-symbols-rounded">help</span></span><div><strong>Ask</strong><span>Next step</span></div></div>
              </div>
            </div>
            <div className={styles.visualFloat}>NO STRESS.</div>
            <div className={styles.visualFloat2}>FAST · RELIABLE · PRACTICAL</div>
          </div>
        </div>
      </section>

      <section className={styles.quickBar}>
        <div className={styles.quickBarInner}>
          <div className={styles.quickLabel}><span className="material-symbols-rounded icon-sm">bolt</span>Student essentials</div>
          <div className={styles.quickRail}>
            {studentNeeds.map(([icon, label]) => <Link href="/app/search" key={label} className={styles.quickItem}><span className="material-symbols-rounded icon-sm">{icon}</span>{label}</Link>)}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div><div className={styles.eyebrow}>YOUR DIGITAL FRONT DESK</div><h2 className={styles.sectionTitle}>What do you need?</h2><p className={styles.sectionSub}>Six things EduReach is built to help a student do quickly.</p></div>
            <span className="text-handwritten" style={{ color: 'var(--secondary-orange)', fontSize: 28 }}>Start anywhere.</span>
          </div>
          <div className={styles.serviceRail}>
            {services.map(service => <Link key={service.title} href={service.href} className={styles.serviceCard}>
              <span className={styles.serviceIcon}><span className="material-symbols-rounded">{service.icon}</span></span>
              <strong>{service.title}</strong>
              <span>{service.text}</span>
              <span className={`material-symbols-rounded icon-sm ${styles.serviceArrow}`}>arrow_forward</span>
            </Link>)}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div><div className={styles.eyebrow}>NIGERIAN STUDENT LIFE</div><h2 className={styles.sectionTitle}>The things you actually deal with.</h2></div>
          </div>
          <div className={styles.essentials}>
            <div className={styles.essentialLead}>
              <h3>One place for the everyday school stuff.</h3>
              <p>Registration, admission, SIWES, exams, letters, fees and clearance are not separate worlds. EduReach brings the practical side of student life together.</p>
              <div className={styles.needGrid}>
                {studentNeeds.map(([icon, label]) => <div className={styles.needItem} key={label}><i><span className="material-symbols-rounded icon-sm">{icon}</span></i>{label}</div>)}
              </div>
            </div>
            <div className={styles.officialPanel}>
              <div className={styles.eyebrow} style={{ color: '#FFCBAD' }}>OFFICIAL LINKS</div>
              <h3>Go straight to the source.</h3>
              <p>When the source is external, EduReach gives you a direct route instead of making you search again.</p>
              <div className={styles.officialLinks}>
                {officialLinks.map(link => <a className={styles.officialLink} href={link.href} target="_blank" rel="noreferrer" key={link.title}><span><strong>{link.title}</strong><br /><small style={{ color: '#BFD0F2' }}>{link.text}</small></span><span className="material-symbols-rounded icon-sm">open_in_new</span></a>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div><div className={styles.eyebrow}>USEFUL RIGHT NOW</div><h2 className={styles.sectionTitle}>Jump straight into a tool.</h2></div>
            <Link href="/app/search" className="btn btn-ghost">Explore</Link>
          </div>
          <div className={styles.serviceRail}>
            {quickLinks.map(link => <Link key={link.title} href={link.href} className={styles.serviceCard}>
              <span className={styles.serviceIcon}><span className="material-symbols-rounded">{link.icon}</span></span>
              <strong>{link.title}</strong>
              <span>{link.text}</span>
              <span className={`material-symbols-rounded icon-sm ${styles.serviceArrow}`}>arrow_forward</span>
            </Link>)}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div><div className={styles.eyebrow}>HOW IT WORKS</div><h2 className={styles.sectionTitle}>Problem → solution.</h2></div>
          </div>
          <div className={styles.processGrid}>
            <div className={styles.processCard}><div className={styles.processNumber}>01</div><h3>Tell us what you need</h3><p>Choose a task, search a school issue, or ask a direct question.</p></div>
            <div className={styles.processCard}><div className={styles.processNumber}>02</div><h3>Get the useful route</h3><p>EduReach surfaces the relevant tool, notice, template, resource or source.</p></div>
            <div className={styles.processCard}><div className={styles.processNumber}>03</div><h3>Get it done</h3><p>Write, calculate, check, open the official portal or save the next step.</p></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div><div className={styles.eyebrow}>TRUST & CLARITY</div><h2 className={styles.sectionTitle}>Useful before clever.</h2></div>
          </div>
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}><div className={styles.trustIcon}><span className="material-symbols-rounded">verified</span></div><strong>Source-first information</strong><span>Important school information can show its source and verification status.</span></div>
            <div className={styles.trustCard}><div className={styles.trustIcon}><span className="material-symbols-rounded">calculate</span></div><strong>Deterministic tools</strong><span>Arithmetic and academic calculations use actual formulas, not generated guesses.</span></div>
            <div className={styles.trustCard}><div className={styles.trustIcon}><span className="material-symbols-rounded">phone_iphone</span></div><strong>Built for Nigerian students</strong><span>Mobile-first, practical and designed around real tertiary-school workflows.</span></div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div><div className={styles.eyebrow} style={{ color: '#FFCBAD' }}>START WITH ONE PROBLEM</div><h2>Let EduReach help you get it done.</h2><p>Start with your school, find a tool, or solve one problem. The platform grows from there.</p></div>
          <Link href="/signup" className="btn btn-primary"><span className="material-symbols-rounded">person_add</span>Create free account</Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}><div><div className={styles.eyebrow}>FAQ</div><h2 className={styles.sectionTitle}>Quick answers.</h2></div></div>
          <div className={styles.faqGrid}>
            {faqs.map(([question, answer]) => <div className={styles.faq} key={question}><strong>{question}</strong><span>{answer}</span></div>)}
          </div>
        </div>
      </section>
    </main>

    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div><div className={styles.footerTitle}>EduReach <span style={{ color: '#FF9A58' }}>Hub</span></div><p className={styles.footerText}>Practical digital support for Nigerian tertiary students — information, documents, tools, resources and next steps in one place.</p></div>
        <div><div className={styles.footerHeading}>Platform</div><Link className={styles.footerLink} href="/app/search">Search</Link><Link className={styles.footerLink} href="/app/write">Write It</Link><Link className={styles.footerLink} href="/app/tools/gpa">Calculate</Link><Link className={styles.footerLink} href="/app/school">My School</Link></div>
        <div><div className={styles.footerHeading}>Trust</div><Link className={styles.footerLink} href="/app/updates">Verified updates</Link><Link className={styles.footerLink} href="/login">Sign in</Link><Link className={styles.footerLink} href="/signup">Create account</Link></div>
      </div>
      <div className={styles.footerBottom}><span>Independent student-support service. Not affiliated with JAMB or any university unless explicitly stated.</span><span>EduReach Hub · Nigeria</span></div>
    </footer>
  </div>
}
