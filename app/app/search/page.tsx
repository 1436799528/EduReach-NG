import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const {q=''}=await searchParams
  const supabase=await createClient()
  let announcements:any[]=[];let institutions:any[]=[]
  if(q.trim()){
    const term=`%${q.trim()}%`
    const [a,i]=await Promise.all([
      supabase.from('edureach_announcements').select('id,title,summary,category,priority,published_at').eq('verification_status','verified').or(`title.ilike.${term},summary.ilike.${term},category.ilike.${term}`).order('published_at',{ascending:false}).limit(20),
      supabase.from('institutions').select('id,school_name,acronym,slug').or(`school_name.ilike.${term},acronym.ilike.${term}`).limit(20)
    ])
    announcements=a.data||[];institutions=i.data||[]
  }
  const suggestions=[['UNICAL','School information, portals and notices'],['JAMB','UTME, admission and CAPS information'],['Post-UTME','Admission screening information'],['SIWES','Industrial training information'],['school fees','Fees and registration notices']]
  return <div>
    <section style={{background:'#102a56',color:'#fff',borderRadius:22,padding:'32px 30px',marginBottom:22}}>
      <div className="eyebrow" style={{color:'#bcd1ff'}}>FIND IT</div>
      <h1 style={{color:'#fff',margin:'8px 0 10px'}}>Looking for school information?</h1>
      <p style={{margin:0,color:'#dbe7ff',lineHeight:1.6}}>Search verified school notices and institutions instead of digging through old WhatsApp messages.</p>
      <form style={{display:'flex',gap:10,marginTop:22,flexWrap:'wrap'}}><input name="q" defaultValue={q} placeholder="e.g. UNICAL cutoff, JAMB, SIWES" aria-label="Search EduReach" style={{flex:1,minWidth:240,border:0,borderRadius:10,padding:'14px 15px',outline:'none'}}/><button className="btn" style={{background:'#fff',color:'#1457d9'}}>Search</button></form>
    </section>
    {q?<div>
      <div className="page-head"><div><div className="eyebrow">SEARCH RESULT</div><h2 style={{margin:'5px 0 0',fontSize:22}}>For “{q}”</h2></div><span className="badge">{announcements.length+institutions.length} found</span></div>
      <div className="grid grid-2">
        <div className="card"><div className="page-head"><h3 style={{margin:0}}>School notices</h3><span className="badge">{announcements.length}</span></div>{announcements.length?<div className="list">{announcements.map(x=><Link href={`/app/updates/${x.id}`} className="list-item" key={x.id}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><span className={`badge ${x.priority==='urgent'?'bad':x.priority==='important'?'warn':'good'}`}>{x.priority}</span><span className="muted">{x.published_at?new Date(x.published_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'}):''}</span></div><strong style={{display:'block',marginTop:8}}>{x.title}</strong><div className="muted" style={{marginTop:4,lineHeight:1.45}}>{x.summary}</div></Link>)}</div>:<div className="notice">No verified school notice matches that search yet.</div>}</div>
        <div className="card"><div className="page-head"><h3 style={{margin:0}}>Schools</h3><span className="badge">{institutions.length}</span></div>{institutions.length?<div className="list">{institutions.map(x=><Link href={x.slug?`/app/school/${x.slug}`:'/app/school'} className="list-item" key={x.id}><strong>{x.school_name}</strong><div className="muted">{x.acronym} · View school information</div></Link>)}</div>:<div className="notice">No matching school found. Try the full school name or acronym.</div>}</div>
      </div>
    </div>:<>
      <div className="page-head"><div><div className="eyebrow">COMMON SEARCHES</div><h2 style={{margin:'5px 0 0',fontSize:22}}>Start with what students usually need</h2></div></div>
      <div className="grid grid-3">{suggestions.map(([title,desc])=><Link key={title} href={`/app/search?q=${encodeURIComponent(title)}`} className="card" style={{minHeight:145}}><div className="eyebrow">SEARCH</div><h3 style={{margin:'8px 0 6px'}}>{title}</h3><p className="muted" style={{margin:0,lineHeight:1.5}}>{desc}</p></Link>)}</div>
      <div className="notice" style={{marginTop:18}}><strong>Trust note:</strong> Search results are limited to verified institutional information. EduReach does not turn rumours into school notices.</div>
    </>}
  </div>
}