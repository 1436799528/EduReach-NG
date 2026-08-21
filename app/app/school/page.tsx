import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SchoolPage(){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  const {data:profile}=user?await supabase.from('profiles').select('full_name,school,faculty,department,level,institution_id,programme_id').eq('id',user.id).maybeSingle():{data:null}
  const institutionId=profile?.institution_id
  const {data:school}=institutionId
    ? await supabase.from('institutions').select('*').eq('id',institutionId).maybeSingle()
    : await supabase.from('institutions').select('*').eq('acronym','UNICAL').maybeSingle()

  const [{data:announcements},{data:programmes},{data:resources},{data:solutions}]=await Promise.all([
    school?supabase.from('edureach_announcements').select('id,title,summary,priority,published_at,source_url,category').eq('institution_id',school.id).eq('verification_status','verified').order('published_at',{ascending:false}).limit(6):Promise.resolve({data:[]}),
    school?supabase.from('programmes').select('id,programme_name,degree_title').eq('institution_id',school.id).eq('is_active',true).order('programme_name').limit(12):Promise.resolve({data:[]}),
    school?supabase.from('resources').select('id,title,description,resource_type,external_url,file_url').eq('status','approved').limit(6):Promise.resolve({data:[]}),
    school?supabase.from('ask_solutions').select('id,problem,answer,action_label,action_href,source_url').eq('institution_id',school.id).eq('is_active',true).eq('verification_status','verified').order('created_at',{ascending:false}).limit(5):Promise.resolve({data:[]})
  ])

  const schoolName=school?.school_name||profile?.school||'University of Calabar'
  const actions=[['Post-UTME','/app/updates'],['School notices','/app/updates'],['GPA / CGPA','/app/tools/gpa'],['Write a letter','/app/write']]
  const portals=[
    ['University website',school?.website_url],
    ['Post-UTME / Admission',school?.admission_portal_url],
    ['Student portal',school?.student_portal_url],
    ['Digital gateways','https://unical.edu.ng/portals.php'],
    ['Transcript portal','https://transcript.unical.edu.ng/']
  ].filter((x):x is [string,string]=>Boolean(x[1]))

  return <div>
    <section className="service-card-container" style={{background:'var(--primary-navy)',color:'#fff',border:0,marginBottom:20}}>
      <div className="eyebrow" style={{color:'#ffd2b9'}}>MY SCHOOL</div>
      <h1 style={{color:'#fff',margin:'8px 0 8px'}}>{schoolName}</h1>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <span className="badge good">VERIFIED</span>
        {profile?.faculty&&<span className="badge">{profile.faculty}</span>}
        {profile?.department&&<span className="badge">{profile.department}</span>}
        {profile?.level&&<span className="badge">Level {profile.level}</span>}
      </div>
    </section>

    <div className="grid grid-2" style={{marginBottom:18}}>
      {actions.map(([label,href])=><Link key={label} href={href} className="service-card-container"><div className="service-icon-badge" style={{background:'var(--secondary-orange)'}}>→</div><h3 className="service-title" style={{textTransform:'none',marginTop:12}}>{label}</h3></Link>)}
    </div>

    <div className="grid grid-2">
      <div className="service-card-container">
        <div className="eyebrow">OFFICIAL PORTALS</div>
        <div className="list">
          {portals.map(([label,url])=><a key={label} className="list-item" href={url} target="_blank" rel="noreferrer"><div style={{display:'flex',justifyContent:'space-between',gap:10}}><strong>{label}</strong><span>↗</span></div></a>)}
        </div>
      </div>

      <div className="service-card-container">
        <div className="eyebrow">NOTICE BOARD</div>
        {announcements?.length?<div className="list">{announcements.map(a=><Link href={`/app/updates/${a.id}`} className="list-item" key={a.id}><div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span className={`badge ${a.priority==='urgent'?'bad':a.priority==='important'?'warn':'good'}`}>{a.priority}</span><span className="muted">{a.category}</span></div><strong style={{display:'block',marginTop:6}}>{a.title}</strong><div className="muted" style={{marginTop:3,fontSize:12}}>{a.published_at?new Date(a.published_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'}):''}</div></Link>)}</div>:<div className="notice">No verified notices yet.</div>}
      </div>
    </div>

    <section className="section"><div className="service-card-container"><div className="page-head"><div><div className="eyebrow">YOUR SCHOOL</div><h2 style={{margin:'4px 0',color:'var(--primary-navy)'}}>Academic structure</h2></div><span className="badge">{programmes?.length||0} shown</span></div>{programmes?.length?<div className="grid grid-3">{programmes.map(p=><div className="card" key={p.id}><strong>{p.programme_name}</strong><div className="muted" style={{marginTop:4}}>{p.degree_title||''}</div></div>)}</div>:<div className="notice">Programme data not available.</div>}</div></section>

    <section className="section" style={{paddingTop:0}}><div className="grid grid-2">
      <div className="service-card-container"><div className="eyebrow">SOLUTIONS</div><h2 style={{margin:'4px 0',color:'var(--primary-navy)'}}>Common student problems</h2>{solutions?.length?<div className="list">{solutions.map(s=><div className="list-item" key={s.id}><strong>{s.problem}</strong><div className="muted" style={{marginTop:4}}>{s.answer}</div>{s.action_href&&<Link href={s.action_href} className="btn btn-secondary" style={{marginTop:8}}>{s.action_label||'Open'}</Link>}</div>)}</div>:<div className="notice">No school-specific solutions yet.</div>}</div>
      <div className="service-card-container"><div className="eyebrow">RESOURCES</div><h2 style={{margin:'4px 0',color:'var(--primary-navy)'}}>Useful now</h2>{resources?.length?<div className="list">{resources.map(r=>{const url=r.external_url||r.file_url;return <div className="list-item" key={r.id}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><strong>{r.title}</strong><span className="badge">{(r.resource_type||'resource').replaceAll('_',' ')}</span></div>{r.description&&<div className="muted" style={{marginTop:4}}>{r.description}</div>}{url&&<a className="btn btn-secondary" style={{marginTop:8}} href={url} target="_blank" rel="noreferrer">Open ↗</a>}</div>})}</div>:<div className="notice">No approved resources yet.</div>}</div>
    </div></section>
  </div>
}
