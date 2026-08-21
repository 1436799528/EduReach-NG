import { createClient } from '@/lib/supabase/server'

export default async function SchoolPage(){
  const supabase=await createClient()
  const {data:school}=await supabase.from('institutions').select('*').eq('acronym','UNICAL').maybeSingle()
  const {data:programmes}=school?await supabase.from('programmes').select('programme_name,degree_title').eq('institution_id',school.id).order('programme_name'): {data:[]}
  const {data:announcements}=school?await supabase.from('edureach_announcements').select('id,title,summary,priority,published_at').eq('institution_id',school.id).eq('verification_status','verified').order('published_at',{ascending:false}).limit(5): {data:[]}
  const links=[['Official website',school?.website_url],['Admission / Post-UTME portal',school?.admission_portal_url],['Student portal',school?.student_portal_url]] as const
  return <>
    <div className="page-head"><div><div className="eyebrow">MY SCHOOL</div><h1>{school?.school_name||'University of Calabar'}</h1><p className="muted">Official institutional information is shown with its source. Empty areas mean we have not verified that data yet.</p></div></div>
    <div className="grid grid-2">
      <div className="card"><h2>Institution profile</h2><p><strong>Type:</strong> {school?.institution_type||'University'}</p><p><strong>State:</strong> {school?.state||'Cross River'}</p><p><strong>Verified:</strong> {school?.is_verified?'Yes':'No'}</p></div>
      <div className="card"><h2>Official links</h2><div className="list">{links.map(([label,url])=>url?<a key={label} className="list-item" href={url} target="_blank" rel="noreferrer"><strong>{label}</strong><div className="muted">{url}</div></a>:<div key={label} className="list-item"><strong>{label}</strong><div className="muted">Not verified yet</div></div>)}</div></div>
    </div>
    <section className="section"><div className="grid grid-2"><div className="card"><h2>Programmes in this dataset</h2>{programmes?.length?<div className="list">{programmes.map(p=><div className="list-item" key={`${p.programme_name}-${p.degree_title}`}><strong>{p.programme_name}</strong><div className="muted">{p.degree_title||'Degree title not recorded'}</div></div>)}</div>:<p className="muted">No verified programme data has been loaded yet.</p>}</div><div className="card"><h2>Latest UNICAL updates</h2>{announcements?.length?<div className="list">{announcements.map(a=><a href={`/app/updates/${a.id}`} className="list-item" key={a.id}><strong>{a.title}</strong><div className="muted">{a.summary}</div></a>)}</div>:<p className="muted">No institution-specific verified updates yet.</p>}</div></div></section>
  </>
}
