import Link from 'next/link'

const actions = [
  ['WRITE','Generate formal letters and requests','/app/write'],
  ['FIND','Search school, JAMB and admission information','/app/search'],
  ['CHECK','Track deadlines, exams and updates','/app/updates'],
  ['CALCULATE','GPA, CGPA and target calculations','/app/tools/gpa'],
  ['GET','Find useful resources and past questions','/app/resources'],
  ['ASK','Find practical answers to student problems','/app/ask'],
]

export default function Home() {
  return <>
    <header className="topbar"><div className="container nav"><Link href="/" className="logo">EduReach <span>Hub</span></Link><nav className="navlinks"><Link href="/app/tools/gpa">Tools</Link><Link href="/app/school">My School</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary">Get Started</Link></nav></div></header>
    <main>
      <section className="hero"><div className="container"><div className="eyebrow">FAST, RELIABLE, NO STRESS.</div><h1>School problem?<br/>Start here.</h1><p>Find school information. Generate letters. Check JAMB updates. Calculate your GPA. Track deadlines. Find useful resources.</p><div className="actions"><Link className="btn btn-primary" href="/signup">Get Started</Link><Link className="btn btn-ghost" href="/app/tools/gpa">Explore Tools</Link></div></div></section>
      <section className="section"><div className="container"><div className="grid grid-3">{actions.map(([title,desc,href])=><Link className="card" href={href} key={title}><div className="eyebrow">{title}</div><h3>{desc}</h3><p className="muted">Open {title.toLowerCase()} →</p></Link>)}</div></div></section>
      <section className="section"><div className="container grid grid-2"><div className="card"><h2>Built for Nigerian tertiary students</h2><p className="muted">EduReach Hub is designed as a practical digital front desk for universities, polytechnics and colleges of education. It is not a replacement for official portals.</p></div><div className="card"><h2>Trust before cleverness</h2><p className="muted">Important school information carries a source and verification status. We do not invent cut-offs, deadlines or institutional requirements.</p></div></div></section>
    </main>
    <footer className="footer"><div className="container">Independent student-support service. Not affiliated with JAMB or any university unless explicitly stated.</div></footer>
  </>
}
