'use client'

import Link from 'next/link'
import { useEffect,useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Result={id:string;title:string;kind:string;detail:string;href:string;priority?:string;source?:string|null}

const suggestions=['UNICAL cutoff','JAMB','Post-UTME','SIWES','school fees','suspension letter','CGPA','clearance']

export default function SearchPage(){
  const [q,setQ]=useState('')
  const [results,setResults]=useState<Result[]>([])
  const [loading,setLoading]=useState(false)
  const [searched,setSearched]=useState(false)

  async function run(term=q){
    const value=term.trim()
    if(!value){setResults([]);setSearched(false);return}
    setLoading(true);setSearched(true)
    const db=createClient(); const like=`%${value}%`
    const [ann,inst,res,temp,solutions]=await Promise.all([
      db.from('edureach_announcements').select('id,title,summary,priority,published_at,source_url').eq('verification_status','verified').or(`title.ilike.${like},summary.ilike.${like},category.ilike.${like}`).order('published_at',{ascending:false}).limit(10),
      db.from('institutions').select('id,school_name,acronym,slug').or(`school_name.ilike.${like},acronym.ilike.${like}`).limit(10),
      db.from('resources').select('id,title,description,external_url,file_url,resource_type').eq('status','approved').or(`title.ilike.${like},description.ilike.${like},resource_type.ilike.${like}`).limit(10),
      db.from('letter_templates').select('id,name,description,slug,category').eq('is_active',true).or(`name.ilike.${like},description.ilike.${like},category.ilike.${like}`).limit(10),
      db.from('ask_solutions').select('id,problem,answer,action_href,action_label,source_url').eq('is_active',true).eq('verification_status','verified').or(`problem.ilike.${like},answer.ilike.${like}`).limit(10)
    ])
    const next:Result[]=[]
    ;(solutions.data||[]).forEach(x=>next.push({id:x.id,title:x.problem,kind:'Answer',detail:x.answer,href:x.action_href||'/app/ask',source:x.source_url}))
    ;(ann.data||[]).forEach(x=>next.push({id:x.id,title:x.title,kind:'Notice',detail:x.summary||'Verified school notice',href:`/app/updates/${x.id}`,priority:x.priority,source:x.source_url}))
    ;(inst.data||[]).forEach(x=>next.push({id:x.id,title:x.school_name,kind:'School',detail:x.acronym||'Institution',href:'/app/school'}))
    ;(res.data||[]).forEach(x=>next.push({id:x.id,title:x.title,kind:'Resource',detail:x.description||'Approved resource',href:x.external_url||x.file_url||'/app/resources'}))
    ;(temp.data||[]).forEach(x=>next.push({id:x.id,title:x.name,kind:'Letter',detail:x.description||x.category,href:'/app/write'}))
    setResults(next);setLoading(false)
  }

  useEffect(()=>{run('')},[])

  return <div>
    <section className="service-card-container" style={{background:'var(--primary-navy)',color:'#fff',border:0,marginBottom:20}}>
      <div className="eyebrow" style={{color:'#ffd2b9'}}>FIND IT</div>
      <h1 style={{color:'#fff',margin:'7px 0 14px'}}>Search EduReach</h1>
      <form onSubmit={e=>{e.preventDefault();run()}} style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="UNICAL cutoff, JAMB, SIWES, suspension letter..." aria-label="Search EduReach" style={{flex:1,minWidth:240,border:0,borderRadius:10,padding:'14px 15px',outline:'none'}} />
        <button className="btn" style={{background:'var(--secondary-orange)',color:'#fff'}}>{loading?'Searching…':'Search'}</button>
      </form>
    </section>

    {!searched?<>
      <div className="eyebrow" style={{marginBottom:10}}>COMMON SEARCHES</div>
      <div className="grid grid-4">{suggestions.map(s=><button key={s} onClick={()=>{setQ(s);run(s)}} className="service-card-container" style={{textAlign:'left',border:0}}><div className="service-icon-badge" style={{background:'var(--secondary-orange)',width:34,height:34,fontSize:12}}>S</div><h3 style={{color:'var(--primary-navy)',margin:'10px 0 0',fontSize:16}}>{s}</h3></button>)}</div>
    </>:<>
      <div className="page-head" style={{marginTop:22}}><div><div className="eyebrow">RESULTS</div><h2 style={{margin:'4px 0',color:'var(--primary-navy)'}}>{results.length?`${results.length} matches`:'No match yet'}</h2></div><span className="badge">{q}</span></div>
      {results.length?<div className="list">{results.map(x=><article className="service-card-container" key={`${x.kind}-${x.id}`}><div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span className="badge">{x.kind}</span>{x.priority&&<span className={`badge ${x.priority==='urgent'?'bad':x.priority==='important'?'warn':'good'}`}>{x.priority}</span>}</div><h3 style={{color:'var(--primary-navy)',margin:'9px 0 5px'}}>{x.title}</h3><p className="muted" style={{margin:'0 0 12px',lineHeight:1.5}}>{x.detail}</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><Link href={x.href} className="btn btn-secondary">Open →</Link>{x.source&&<a href={x.source} target="_blank" rel="noreferrer" className="btn btn-ghost">Source ↗</a>}</div></article>)}</div>:<div className="notice"><strong>Nothing verified matched “{q}”.</strong><div className="muted" style={{marginTop:4}}>Try another phrase or use Ask for a direct student problem.</div><Link href="/app/ask" className="btn btn-secondary" style={{marginTop:10}}>Ask instead</Link></div>}
    </>}
  </div>
}
