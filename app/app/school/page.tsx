import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SchoolPage(){
  const supabase=await createClient()
  const {data:school}=await supabase.from('institutions').select('*').eq('acronym','UNICAL').maybeSingle()
  const {data:programmes}=school?await supabase.from('programmes').select('programme_name,degree_title').eq('institution_id',school.id).order('programme_name'): {data:[]}
  const {data:announcements}=school?await supabase.from('edureach_announcements').select('id,title,summary,priority,published_at').eq('institution_id',school.id).eq('verification_status','verified').order('published_at',{ascending:false}).limit(5): {data:[]}
  const links=[['Official website',school?.website_url],['Admission / Post-UTME portal',school?.admission_portal_url],['Student portal',school?.student_portal_url]] as const
  return <div>
    <section style={{background:'#102a56',color:'#fff',borderRadius:22,padding:'28px 30px',marginBottom:22}}>
      <div className="eyebrow" style={{color:'#bcd1ff'}}>MY SCHOOL</div>
      <h1 style={{color:'#fff',margin:'8px 0 10px',fontSize:'clamp(30px,5vw,44px)'}}>{school?.school_name||'University of Calabar'}</h1>
      <p style={{margin:0,color:'#dbe7ff',maxWidth:700,lineHeight:1.6}}>Your institutional home for verified links, programme information and school-specific updates.</p>
    </section>
    <div className="grid grid-3">
      <div className="card"><div className="label">Institution type</div><div className="stat" style={{fontSize:20,marginTop:7}}>{school?.institution_type||'University'}</div><div className="muted" style={{marginTop:5}}>Cross River State</div></div>
      <div className="card"><div className="label">Verification</div><div className="stat" style={{fontSize:20,marginTop:7}}>{school?.is_verified?'Verified':'Pending'}</div><div className="muted" style={{marginTop:5}}>Institution record</div></div>
      <div className="card"><div className="label">Programmes loaded</div><div className="stat" style={{marginTop:7}}>{programmes?.length||0}</div><div className="muted" style={{marginTop:5}}>From verified dataset</div></div>
    </div>
    <section className="section" style={{paddingBottom:8}}><div className="grid grid-2">
      <div className="card"><div className="page-head"><div><div className="eyebrow">OFFICIAL</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Important links</h2></div></div><div className="list">{links.map(([label,url])=>url?<a key={label} className="list-item" href={url} target="_blank" rel="noreferrer"><strong>{label}</strong><div className="muted" style={{marginTop:4,overflowWrap:'anywhere'}}>{url}</div></a>:<div key={label} className="list-item"><strong>{label}</strong><div className="muted">Not verified yet</div></div>)}</div></div>
      <div className="card"><div className="page-head"><div><div className="eyebrow">UPDATES</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Latest from UNICAL</h2></div><Link href="/app/updates" className="btn btn-ghost">All updates</Link></div>{announcements?.length?<div className="list">{announcements.map(a=><Link href={`/app/updates/${a.id}`} className="list-item" key={a.id}><span className={`badge ${a.priority==='urgent'?'bad':a.priority==='important'?'warn':'good'}`}>{a.priority}</span><strong style={{display:'block',marginTop:8}}>{a.title}</strong><div className="muted" style={{marginTop:4,lineHeight:1.45}}>{a.summary}</div></Link>)}</div>:<p className="muted">No institution-specific verified updates yet.</p>}</div>
    </div></section>
    <section className="section"><div className="card"><div className="page-head"><div><div className="eyebrow">ACADEMICS</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Programmes in EduReach</h2></div><span className="badge">{programmes?.length||0} loaded</span></div>{programmes?.length?<div className="grid grid-3">{programmes.map(p=><div className="card" key={`${p.programme_name}-${p.degree_title}`} style={{boxShadow:'none'}}><strong>{p.programme_name}</strong><div className="muted" style={{marginTop:6}}>{p.degree_title||'Degree title not recorded'}</div></div>)}</div>:<div className="notice">No verified programme data has been loaded yet.</div>}</div></section>
  </div>
}
