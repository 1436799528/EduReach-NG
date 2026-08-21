import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await createClient()
  const { data: course } = await db.from('courses').select('id,code,title,units,level,semester,source_type,verification_status,source_url,source_note,department_id,programme_id').eq('id', id).maybeSingle()
  if (!course) return <div className="notice">Course not found.</div>
  const [{ data: resources }, { data: department }, { data: programme }] = await Promise.all([
    db.from('resources').select('id,title,description,resource_type,external_url,file_url').eq('course_id', id).eq('status','approved').order('created_at',{ascending:false}).limit(12),
    db.from('departments').select('name,faculty_id').eq('id',course.department_id).maybeSingle(),
    course.programme_id ? db.from('programmes').select('programme_name,degree_title').eq('id',course.programme_id).maybeSingle() : Promise.resolve({data:null})
  ])
  return <div>
    <section className="service-card-container" style={{background:'var(--primary-navy)',color:'#fff',border:0,marginBottom:20}}>
      <div className="eyebrow" style={{color:'#ffd2b9'}}>COURSE</div>
      <h1 style={{color:'#fff',margin:'8px 0'}}>{course.code}</h1>
      <p style={{margin:0,color:'#e8eef9',fontSize:18,fontWeight:700}}>{course.title}</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><span className="badge good">VERIFIED</span><span className="badge">{course.source_type==='ccmas'?'CCMAS Core':'UNICAL Verified'}</span><span className="badge">{course.units} unit{course.units===1?'':'s'}</span><span className="badge">{course.level} Level</span>{course.semester&&<span className="badge">{course.semester===1?'1st':'2nd'} semester</span>}</div>
    </section>
    <div className="grid grid-2">
      <div className="service-card-container"><div className="eyebrow">ACADEMIC PATH</div><div className="list">{department&&<div className="list-item"><strong>Department</strong><div className="muted">{department.name}</div></div>}{programme&&<div className="list-item"><strong>Programme</strong><div className="muted">{programme.programme_name} {programme.degree_title ? `· ${programme.degree_title}` : ''}</div></div>}</div>{course.source_url&&<a href={course.source_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{marginTop:12}}>View source ↗</a>}</div>
      <div className="service-card-container"><div className="eyebrow">GET HELP</div><div className="grid grid-2"><Link className="btn btn-primary" href="/app/resources">Find resources</Link><Link className="btn btn-secondary" href="/app/tools/gpa">Calculate</Link><Link className="btn btn-secondary" href={`/app/search?q=${encodeURIComponent(course.code)}`}>Search {course.code}</Link><Link className="btn btn-secondary" href="/app/ask">Ask a problem</Link></div></div>
    </div>
    <section className="section"><div className="service-card-container"><div className="page-head"><div><div className="eyebrow">RESOURCES</div><h2 style={{margin:'4px 0',color:'var(--primary-navy)'}}>{course.code} materials</h2></div><span className="badge">{resources?.length||0}</span></div>{resources?.length?<div className="list">{resources.map(r=>{const url=r.external_url||r.file_url;return <div className="list-item" key={r.id}><strong>{r.title}</strong>{r.description&&<div className="muted" style={{marginTop:4}}>{r.description}</div>}{url&&<a href={url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{marginTop:8}}>Open ↗</a>}</div>})}</div>:<div className="notice">No approved materials linked to this course yet.</div>}</div></section>
  </div>
}