import Link from 'next/link'

const services = [
  {icon:'✎', title:'WRITE', text:'Write a proper letter to your HOD, Dean or school office.', href:'/app/write'},
  {icon:'⌕', title:'FIND', text:'Find JAMB, Post-UTME, admission and school information.', href:'/app/search'},
  {icon:'✓', title:'CHECK', text:'Check school notices, registration, exams and deadlines.', href:'/app/updates'},
  {icon:'∑', title:'CALCULATE', text:'Calculate GPA, CGPA and the grades you need to reach a target.', href:'/app/tools/gpa'},
  {icon:'▣', title:'GET', text:'Get past questions, guides, forms and useful documents.', href:'/app/resources'},
  {icon:'?', title:'ASK', text:'Find help for a school process or everyday student problem.', href:'/app/ask'},
]

const studentReality = ['JAMB & CAPS','Post-UTME','Course registration','HOD / Dean letters','SIWES','School fees','Examinations','Clearance']

export default function Home(){
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
      <section style={{background:'var(--primary-navy)',color:'#fff',position:'relative',overflow:'hidden'}}>
        <div className="container" style={{paddingTop:76,paddingBottom:72}}>
          <div className="eyebrow" style={{color:'#FFB17D'}}>FOR NIGERIAN TERTIARY STUDENTS</div>
          <h1 style={{color:'#fff',fontSize:'clamp(42px,7vw,72px)',maxWidth:760}}>School problem?<br/><span style={{color:'var(--secondary-orange)'}}>Start here.</span></h1>
          <p style={{color:'#DDE7FF',maxWidth:720,fontSize:18,lineHeight:1.8,margin:0}}>Need a letter to your HOD? Looking for JAMB information? Checking a deadline? Calculating your CGPA? EduReach puts the practical answer in one place.</p>
          <div className="actions" style={{marginTop:28}}>
            <Link className="btn btn-primary" href="/signup">Get Started</Link>
            <Link className="btn" href="/app/school" style={{background:'#fff',color:'var(--primary-navy)'}}>See My School</Link>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:22}}>
            <span className="badge" style={{background:'rgba(255,255,255,.12)',color:'#fff'}}>UNICAL first</span>
            <span className="badge" style={{background:'rgba(255,255,255,.12)',color:'#fff'}}>Verified sources</span>
            <span className="badge" style={{background:'rgba(255,255,255,.12)',color:'#fff'}}>Mobile-first</span>
          </div>
        </div>
        <div aria-hidden="true" style={{position:'absolute',right:'-80px',bottom:'-120px',width:330,height:330,borderRadius:'50%',background:'rgba(232,100,12,.13)'}} />
        <div aria-hidden="true" style={{position:'absolute',right:'110px',top:'50px',width:110,height:110,borderRadius:'50%',border:'1px solid rgba(255,255,255,.13)'}} />
      </section>

      <section className="section" style={{background:'var(--bg-light-gray)'}}>
        <div className="container">
          <div className="page-head">
            <div><div className="eyebrow">YOUR DIGITAL FRONT DESK</div><h2 style={{margin:'5px 0 0',fontSize:30,color:'var(--primary-navy)'}}>What do you need help with?</h2></div>
            <div className="text-handwritten" style={{color:'var(--secondary-orange)',fontSize:30}}>No stress.</div>
          </div>
          <div className="service-card-container">
            <div className="grid grid-2">
              {services.map(service=><Link href={service.href} className="service-item" key={service.title}>
                <span className="service-icon-badge" style={{background:'var(--primary-navy)',fontSize:20}}>{service.icon}</span>
                <span><h3 className="service-title">{service.title}</h3><p className="service-description">{service.text}</p></span>
              </Link>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{background:'#fff'}}>
        <div className="container grid grid-2" style={{alignItems:'stretch'}}>
          <div className="card" style={{background:'#fff'}}>
            <div className="eyebrow">BUILT AROUND REAL STUDENT LIFE</div>
            <h2 style={{color:'var(--primary-navy)',fontSize:28,margin:'7px 0 18px'}}>The things students actually deal with.</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
              {studentReality.map(item=><div key={item} style={{border:'1px solid rgba(10,34,92,.08)',borderRadius:10,padding:'11px 12px',fontWeight:700,color:'var(--primary-navy)',background:'#FAFBFD'}}>{item}</div>)}
            </div>
          </div>
          <div className="card" style={{background:'var(--primary-navy)',color:'#fff'}}>
            <div className="eyebrow" style={{color:'#FFB17D'}}>TRUST MATTERS</div>
            <h2 style={{fontSize:28,margin:'7px 0 15px',color:'#fff'}}>Useful before clever.</h2>
            <p style={{color:'#DDE7FF',lineHeight:1.75,marginTop:0}}>EduReach is an independent student-support service. Important school information carries a source and verification status. We do not invent cut-off marks, fees, deadlines or admission requirements.</p>
            <Link href="/app/updates" className="btn" style={{background:'#fff',color:'var(--primary-navy)',marginTop:10}}>See verified updates</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{background:'var(--bg-light-gray)'}}>
        <div className="container" style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',flexWrap:'wrap'}}>
          <div><div className="eyebrow">START WITH ONE PROBLEM</div><h2 style={{margin:'6px 0 0',color:'var(--primary-navy)',fontSize:30}}>Let EduReach help you get it done.</h2></div>
          <Link href="/signup" className="btn btn-primary">Create free account</Link>
        </div>
      </section>
    </main>

    <footer className="footer">
      <div className="container" style={{display:'flex',justifyContent:'space-between',gap:18,flexWrap:'wrap'}}>
        <span>EduReach Hub — practical support for Nigerian tertiary students.</span>
        <span>Independent service. Always confirm high-stakes information with the official source.</span>
      </div>
    </footer>
  </>
}
