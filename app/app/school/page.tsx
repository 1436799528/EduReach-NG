import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SchoolPage(){
  const supabase=await createClient()
  const {data:school}=await supabase.from('institutions').select('*').eq('acronym','UNICAL').maybeSingle()
  const {data:programmes}=school?await supabase.from('programmes').select('programme_name,degree_title').eq('institution_id',school.id).order('programme_name'): {data:[]}
  const {data:announcements}=school?await supabase.from('edureach_announcements').select('id,title,summary,priority,published_at').eq('institution_id',school.id).eq('verification_status','verified').order('published_at',{ascending:false}).limit(5): {data:[]}
  const links=[['Official website',school?.website_url],['Post-UTME / Admission portal',school?.admission_portal_url],['Student portal',school?.student_portal_url]] as const
  return <div>
    <section style={{background:'#102a56',color:'#fff',borderRadius:22,padding:'28px 30px',marginBottom:22}}>
      <div className="eyebrow" style={{color:'#bcd1ff'}}>MY SCHOOL</div>
      <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div>
          <h1 style={{color:'#fff',margin:'8px 0 10px',fontSize:'clamp(30px,5vw,44px)'}}>{school?.school_name||'University of Calabar'}</h1>
          <p style={{margin:0,color:'#dbe7ff',maxWidth:700,lineHeight:1.6}}>Your school information centre — admissions, portals, notices and academic information in one place.</p>
        </div>
        <span className="badge good" style={{marginTop:4}}>VERIFIED SCHOOL</span>
      </div>
    </section>

    <div className="grid grid-3">
      <div className="card"><div className="label">School type</div><div className="stat" style={{fontSize:20,marginTop:7}}>University</div><div className="muted" style={{marginTop:5}}>Federal • Cross River State</div></div>
      <div className="card"><div className="label">Your school hub</div><div className="stat" style={{fontSize:20,marginTop:7}}>UNICAL</div><div className="muted" style={{marginTop:5}}>University of Calabar</div></div>
      <div className="card"><div className="label">Programmes available</div><div className="stat" style={{marginTop:7}}>{programmes?.length||0}</div><div className="muted" style={{marginTop:5}}>Verified in EduReach</div></div>
    </div>

    <section className="section" style={{paddingBottom:8}}>
      <div className="grid grid-2">
        <div className="card">
          <div className="page-head"><div><div className="eyebrow">WHERE STUDENTS GO</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Official school portals</h2></div></div>
          <div className="list">{links.map(([label,url])=>url?<a key={label} className="list-item" href={url} target="_blank" rel="noreferrer"><div style={{display:'flex',justifyContent:'space-between',gap:12}}><strong>{label}</strong><span aria-hidden="true">↗</span></div><div className="muted" style={{marginTop:4,overflowWrap:'anywhere'}}>{url}</div></a>:<div key={label} className="list-item"><strong>{label}</strong><div className="muted">Not verified yet</div></div>)}</div>
          <div className="notice" style={{marginTop:14}}>EduReach is independent. Always confirm high-stakes admission or registration information on the official school portal.</div>
        </div>

        <div className="card">
          <div className="page-head"><div><div className="eyebrow">SCHOOL NOTICE BOARD</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Latest UNICAL updates</h2></div><Link href="/app/updates" className="btn btn-ghost">See all</Link></div>
          {announcements?.length?<div className="list">{announcements.map(a=><Link href={`/app/updates/${a.id}`} className="list-item" key={a.id}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><span className={`badge ${a.priority==='urgent'?'bad':a.priority==='important'?'warn':'good'}`}>{a.priority==='urgent'?'URGENT':a.priority==='important'?'IMPORTANT':'GENERAL'}</span><span className="muted">{a.published_at?new Date(a.published_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'}):''}</span></div><strong style={{display:'block',marginTop:8}}>{a.title}</strong><div className="muted" style={{marginTop:4,lineHeight:1.45}}>{a.summary}</div></Link>)}</div>:<p className="muted">No verified UNICAL notices are available yet.</p>}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="card">
        <div className="page-head"><div><div className="eyebrow">ACADEMIC STRUCTURE</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Programmes available</h2></div><span className="badge">{programmes?.length||0} loaded</span></div>
        {programmes?.length?<div className="grid grid-3">{programmes.map(p=><div className="card" key={`${p.programme_name}-${p.degree_title}`} style={{boxShadow:'none',border:'1px solid var(--border)'}}><strong>{p.programme_name}</strong><div className="muted" style={{marginTop:6}}>{p.degree_title||'Degree title not recorded'}</div></div>)}</div>:<div className="notice">Programme information is being verified before publication.</div>}
      </div>
    </section>
  </div>
}
