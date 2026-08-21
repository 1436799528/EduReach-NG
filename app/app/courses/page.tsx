import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string; level?: string; semester?: string }> }) {
  const { q = '', level = '', semester = '' } = await searchParams
  const db = await createClient()
  let query = db.from('courses').select('id,code,title,units,level,semester,source_type,verification_status,department_id,programme_id').eq('is_active', true).eq('verification_status', 'verified').order('code').limit(100)
  if (q.trim()) query = query.or(`code.ilike.%${q.trim()}%,title.ilike.%${q.trim()}%`)
  if (level) query = query.eq('level', Number(level))
  if (semester) query = query.eq('semester', Number(semester))
  const { data: courses } = await query
  const labels: Record<string,string> = { ccmas: 'CCMAS Core', institution: 'UNICAL Verified', manual: 'Manual' }
  return <div>
    <section className="service-card-container" style={{background:'var(--primary-navy)',color:'#fff',border:0,marginBottom:20}}>
      <div className="eyebrow" style={{color:'#ffd2b9'}}>COURSE FINDER</div>
      <h1 style={{color:'#fff',margin:'8px 0'}}>Find your course.</h1>
      <form style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}>
        <input name="q" defaultValue={q} placeholder="EEE 321, engineering mathematics" style={{flex:1,minWidth:240,border:0,borderRadius:10,padding:'13px 14px'}} />
        <select name="level" defaultValue={level} style={{border:0,borderRadius:10,padding:'13px 12px'}}><option value="">All levels</option>{[100,200,300,400,500].map(x=><option key={x}>{x}</option>)}</select>
        <select name="semester" defaultValue={semester} style={{border:0,borderRadius:10,padding:'13px 12px'}}><option value="">Any semester</option><option value="1">1st</option><option value="2">2nd</option></select>
        <button className="btn btn-primary"><span className="material-symbols-rounded icon-sm" aria-hidden="true">search</span>Search</button>
      </form>
    </section>
    <div className="page-head"><div><div className="eyebrow">RESULTS</div><h2 style={{color:'var(--primary-navy)',margin:'5px 0'}}>Courses {q ? `for “${q}”` : ''}</h2></div><span className="badge"><span className="material-symbols-rounded icon-sm" aria-hidden="true">menu_book</span>{courses?.length || 0} found</span></div>
    <div className="grid grid-3">{courses?.map(c=><Link href={`/app/courses/${c.id}`} className="service-card-container" key={c.id}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><strong style={{color:'var(--primary-navy)',fontSize:18}}>{c.code}</strong><span className="badge good"><span className="material-symbols-rounded icon-sm" aria-hidden="true">verified</span>{labels[c.source_type]||c.source_type}</span></div><div style={{marginTop:8,fontWeight:700}}>{c.title}</div><div className="muted" style={{marginTop:6}}><span className="material-symbols-rounded icon-sm" style={{verticalAlign:'middle',marginRight:4}} aria-hidden="true">school</span>{c.units} unit{c.units===1?'':'s'} · {c.level} Level{c.semester?` · ${c.semester===1?'1st':'2nd'} semester`:''}</div></Link>)}</div>
    {!courses?.length && <div className="notice"><span className="material-symbols-rounded icon-sm" aria-hidden="true">info</span> No verified course matches that search yet. Try the course code or title, or submit an institution-specific course.</div>}
  </div>
}