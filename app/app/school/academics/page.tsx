import { createClient } from '@/lib/supabase/server'

export default async function AcademicCataloguePage(){
  const supabase=await createClient()
  const {data:school}=await supabase.from('institutions').select('id,school_name,acronym').eq('acronym','UNICAL').maybeSingle()
  const {data:faculties}=school?await supabase.from('faculties').select('id,name').eq('institution_id',school.id).order('name'):{data:[]}
  const {data:departments}=school?await supabase.from('departments').select('id,name,faculty_id').order('name'):{data:[]}
  const {data:programmes}=school?await supabase.from('programmes').select('id,programme_name,degree_title,department_id').eq('institution_id',school.id).eq('is_active',true).order('programme_name'):{data:[]}
  const {data:courses}=school?await supabase.from('courses').select('id,code,title,units,level,semester,department_id,programme_id').eq('is_active',true).order('level').order('semester').order('code'):{data:[]}
  const deptByFaculty=new Map<string,any[]>();(departments||[]).forEach(d=>{const list=deptByFaculty.get(d.faculty_id)||[];list.push(d);deptByFaculty.set(d.faculty_id,list)})
  const programmesByDepartment=new Map<string,any[]>();(programmes||[]).forEach(p=>{const list=programmesByDepartment.get(p.department_id)||[];list.push(p);programmesByDepartment.set(p.department_id,list)})
  const coursesByProgramme=new Map<string,any[]>();(courses||[]).forEach(c=>{if(c.programme_id){const list=coursesByProgramme.get(c.programme_id)||[];list.push(c);coursesByProgramme.set(c.programme_id,list)}})
  return <div>
    <section className="service-card-container" style={{background:'var(--primary-navy)',color:'#fff',border:0,marginBottom:20}}>
      <div className="eyebrow" style={{color:'#ffd2b9'}}>MY SCHOOL · ACADEMICS</div>
      <h1 style={{color:'#fff',margin:'8px 0'}}>UNICAL academic catalogue</h1>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><span className="badge">{faculties?.length||0} faculties</span><span className="badge">{departments?.length||0} departments</span><span className="badge">{programmes?.length||0} programmes</span><span className="badge">{courses?.length||0} course records</span></div>
    </section>
    <div className="notice" style={{marginBottom:18}}><strong>Verification:</strong> The catalogue shows only records currently stored and approved in EduReach. Course-level records will continue to expand as official curricula are verified.</div>
    <div className="list">{(faculties||[]).map(f=><section className="service-card-container" key={f.id} style={{marginBottom:12}}><div className="eyebrow">FACULTY</div><h2 style={{margin:'5px 0 14px',color:'var(--primary-navy)'}}>{f.name}</h2><div className="grid grid-2">{(deptByFaculty.get(f.id)||[]).map(d=><div className="card" key={d.id}><strong>{d.name}</strong><div className="list" style={{marginTop:10}}>{(programmesByDepartment.get(d.id)||[]).map(p=><div className="list-item" key={p.id}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><span>{p.programme_name}</span><span className="badge">{(coursesByProgramme.get(p.id)||[]).length} courses</span></div><div className="muted" style={{marginTop:4}}>{p.degree_title||'Degree title not recorded'}</div>{(coursesByProgramme.get(p.id)||[]).slice(0,6).map(c=><div key={c.id} className="muted" style={{fontSize:12,marginTop:4}}>{c.code} · {c.title} · {c.units} unit{c.units===1?'':'s'}</div>)}</div>)}</div></div>)}</div></section>)}</div>
  </div>
}
