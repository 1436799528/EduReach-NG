import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const actions = [
  { label: 'WRITE', title: 'Write a letter', text: 'Create a properly structured school letter in minutes.', href: '/app/write' },
  { label: 'FIND', title: 'Find school information', text: 'Search verified information for your school and programme.', href: '/app/search' },
  { label: 'CHECK', title: 'Check updates', text: 'See important admissions, registration and school notices.', href: '/app/updates' },
  { label: 'CALCULATE', title: 'Calculate GPA / CGPA', text: 'Work out your GPA, target CGPA and what-if scenarios.', href: '/app/tools/gpa' },
  { label: 'GET', title: 'Get resources', text: 'Browse useful guides, forms and academic resources.', href: '/app/resources' },
  { label: 'ASK', title: 'Ask a question', text: 'Start with practical answers, guides and verified information.', href: '/app/ask' },
]

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('full_name,school,level,department,institution_id').eq('id', user!.id).maybeSingle()
  const { data: updates } = await supabase.from('edureach_announcements').select('id,title,summary,category,priority,published_at').eq('verification_status','verified').not('published_at','is',null).order('published_at',{ascending:false}).limit(4)
  const { data: tasks } = await supabase.from('edureach_tasks').select('id,title,due_at,priority').eq('user_id',user!.id).eq('status','pending').order('due_at',{ascending:true}).limit(4)

  const firstName = profile?.full_name?.trim().split(/\s+/)[0]
  const schoolLabel = profile?.school || 'Set up your school profile'

  return <div>
    <section style={{background:'linear-gradient(135deg,#102a56 0%,#1457d9 62%,#2b78ff 100%)',color:'#fff',borderRadius:22,padding:'30px',marginBottom:22,boxShadow:'0 14px 35px rgba(16,42,86,.18)'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div style={{maxWidth:650}}>
          <div className="eyebrow" style={{color:'#cfe0ff'}}>YOUR STUDENT FRONT DESK</div>
          <h1 style={{fontSize:'clamp(32px,5vw,48px)',color:'#fff',margin:'10px 0 12px'}}>What do you need help with?</h1>
          <p style={{margin:0,color:'#e5edff',fontSize:16,lineHeight:1.65}}>{firstName ? `Welcome back, ${firstName}. ` : ''}Find the information, tool or document you need without searching through scattered WhatsApp messages and notice boards.</p>
        </div>
        <Link href="/app/search" className="btn" style={{background:'#fff',color:'#1457d9',minWidth:120}}>Search</Link>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:24}}>
        <span className="badge" style={{background:'rgba(255,255,255,.14)',color:'#fff'}}>{schoolLabel}</span>
        {profile?.level && <span className="badge" style={{background:'rgba(255,255,255,.14)',color:'#fff'}}>Level {profile.level}</span>}
        {profile?.department && <span className="badge" style={{background:'rgba(255,255,255,.14)',color:'#fff'}}>{profile.department}</span>}
      </div>
    </section>

    <div className="page-head"><div><div className="eyebrow">Six things EduReach does</div><h2 style={{margin:'5px 0 0',fontSize:24}}>Start with the problem you have</h2></div></div>
    <div className="grid grid-3">
      {actions.map((action,index)=><Link href={action.href} className="card" key={action.label} style={{minHeight:165,display:'flex',flexDirection:'column',justifyContent:'space-between',transition:'transform .15s ease,box-shadow .15s ease'}}>
        <div><div className="eyebrow">0{index+1} · {action.label}</div><h3 style={{fontSize:18,marginTop:10}}>{action.title}</h3><p className="muted" style={{lineHeight:1.55,marginBottom:0}}>{action.text}</p></div>
        <div style={{marginTop:18,color:'#1457d9',fontWeight:800,fontSize:13}}>Open →</div>
      </Link>)}
    </div>

    <section className="section" style={{paddingBottom:10}}>
      <div className="grid grid-2">
        <div className="card" style={{minHeight:230}}><div className="page-head" style={{marginBottom:8}}><div><div className="eyebrow">CHECK</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Your attention</h2></div><Link href="/app/tasks" className="btn btn-ghost">View tasks</Link></div>
          {tasks?.length ? <div className="list">{tasks.map(t=><div className="list-item" key={t.id}><strong>{t.title}</strong><div className="muted" style={{marginTop:5}}>{t.due_at ? new Date(t.due_at).toLocaleString() : 'No deadline'} · {t.priority}</div></div>)}</div> : <div className="notice" style={{marginTop:18}}><strong>No pending tasks.</strong><div className="muted" style={{marginTop:4}}>You are clear for now. Add a task when there is something you need to remember.</div></div>}
        </div>
        <div className="card" style={{minHeight:230}}><div className="page-head" style={{marginBottom:8}}><div><div className="eyebrow">VERIFIED INFORMATION</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Latest updates</h2></div><Link href="/app/updates" className="btn btn-ghost">See all</Link></div>
          {updates?.length ? <div className="list">{updates.map(u=><Link href={`/app/updates/${u.id}`} className="list-item" key={u.id}><span className={`badge ${u.priority==='urgent'?'bad':u.priority==='important'?'warn':'good'}`}>{u.priority}</span><strong style={{display:'block',marginTop:8}}>{u.title}</strong><div className="muted" style={{marginTop:4,lineHeight:1.45}}>{u.summary}</div></Link>)}</div> : <div className="notice" style={{marginTop:18}}>No verified updates are available yet.</div>}
        </div>
      </div>
    </section>
  </div>
}
