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

const quickTools = [
  { title: 'GPA calculator', text: 'Calculate this semester\'s GPA.', href: '/app/tools/gpa' },
  { title: 'Write a letter', text: 'Start from a ready-made template.', href: '/app/write' },
  { title: 'School updates', text: 'See the latest verified notices.', href: '/app/updates' },
]

function formatDueDate(value: string | null) {
  if (!value) return 'No deadline'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Deadline unavailable'
  return new Intl.DateTimeFormat('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(date)
}

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: updates }, { data: tasks }] = await Promise.all([
    supabase.from('profiles').select('full_name,school,level,department,institution_id').eq('id', user!.id).maybeSingle(),
    supabase.from('edureach_announcements').select('id,title,summary,category,priority,published_at').eq('verification_status','verified').not('published_at','is',null).order('published_at',{ascending:false}).limit(4),
    supabase.from('edureach_tasks').select('id,title,due_at,priority').eq('user_id',user!.id).eq('status','pending').order('due_at',{ascending:true}).limit(4),
  ])

  const firstName = profile?.full_name?.trim().split(/\s+/)[0]
  const schoolLabel = profile?.school || 'Add your school'
  const pendingCount = tasks?.length ?? 0

  return (
    <div>
      <section style={{background:'linear-gradient(135deg,#102a56 0%,#1457d9 68%,#2b78ff 100%)',color:'#fff',borderRadius:22,padding:'clamp(24px,4vw,36px)',marginBottom:24,boxShadow:'0 16px 40px rgba(16,42,86,.18)'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:24,alignItems:'flex-start',flexWrap:'wrap'}}>
          <div style={{maxWidth:700}}>
            <div className="eyebrow" style={{color:'#cfe0ff'}}>YOUR STUDENT FRONT DESK</div>
            <h1 style={{fontSize:'clamp(32px,5vw,48px)',color:'#fff',margin:'10px 0 12px',lineHeight:1.06}}>What do you need help with?</h1>
            <p style={{margin:0,color:'#e5edff',fontSize:16,lineHeight:1.65}}>{firstName ? `Welcome back, ${firstName}. ` : ''}Find the information, tool or document you need without digging through scattered messages and notice boards.</p>
          </div>
          <Link href="/app/search" className="btn" style={{background:'#fff',color:'#1457d9',minWidth:126}}>Search EduReach</Link>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:26}}>
          <span className="badge" style={{background:'rgba(255,255,255,.14)',color:'#fff'}}>{schoolLabel}</span>
          {profile?.level && <span className="badge" style={{background:'rgba(255,255,255,.14)',color:'#fff'}}>Level {profile.level}</span>}
          {profile?.department && <span className="badge" style={{background:'rgba(255,255,255,.14)',color:'#fff'}}>{profile.department}</span>}
        </div>
      </section>

      <section style={{marginBottom:28}}>
        <div className="page-head" style={{marginBottom:14}}>
          <div><div className="eyebrow">START HERE</div><h2 style={{margin:'5px 0 0',fontSize:24}}>What are you trying to do?</h2></div>
        </div>
        <div className="grid grid-3">
          {actions.map((action,index)=>(
            <Link href={action.href} className="card" key={action.label} style={{minHeight:166,display:'flex',flexDirection:'column',justifyContent:'space-between',transition:'transform .15s ease,box-shadow .15s ease'}}>
              <div>
                <div className="eyebrow">0{index+1} · {action.label}</div>
                <h3 style={{fontSize:18,marginTop:10}}>{action.title}</h3>
                <p className="muted" style={{lineHeight:1.55,marginBottom:0}}>{action.text}</p>
              </div>
              <div style={{marginTop:18,color:'#1457d9',fontWeight:800,fontSize:13}}>Open {action.label.toLowerCase()} →</div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{marginBottom:28}}>
        <div className="page-head" style={{marginBottom:14}}>
          <div><div className="eyebrow">QUICK TOOLS</div><h2 style={{margin:'5px 0 0',fontSize:22}}>Useful shortcuts</h2></div>
        </div>
        <div className="grid grid-3">
          {quickTools.map(tool=><Link href={tool.href} className="card" key={tool.title} style={{padding:18}}><strong>{tool.title}</strong><p className="muted" style={{fontSize:13,lineHeight:1.5,margin:'6px 0 0'}}>{tool.text}</p><div style={{color:'#1457d9',fontWeight:800,fontSize:12,marginTop:14}}>Open →</div></Link>)}
        </div>
      </section>

      <section>
        <div className="grid grid-2">
          <div className="card" style={{minHeight:250}}>
            <div className="page-head" style={{marginBottom:8}}>
              <div><div className="eyebrow">CHECK</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Your attention</h2></div>
              <Link href="/app/tasks" className="btn btn-ghost">View tasks</Link>
            </div>
            {pendingCount > 0 ? (
              <>
                <div className="label" style={{margin:'12px 0 2px'}}>{pendingCount} pending task{pendingCount === 1 ? '' : 's'}</div>
                <div className="list">
                  {tasks?.map(task=><div className="list-item" key={task.id}>
                    <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start'}}><strong>{task.title}</strong><span className={`badge ${task.priority==='urgent'?'bad':task.priority==='high'?'warn':''}`}>{task.priority}</span></div>
                    <div className="muted" style={{marginTop:6,fontSize:13}}>{formatDueDate(task.due_at)}</div>
                  </div>)}
                </div>
              </>
            ) : (
              <div className="notice" style={{marginTop:18}}><strong>Nothing urgent here.</strong><div className="muted" style={{marginTop:5}}>You have no pending tasks. Add one when there is something important to remember.</div><Link href="/app/tasks" className="btn btn-secondary" style={{marginTop:14}}>Add a task</Link></div>
            )}
          </div>

          <div className="card" style={{minHeight:250}}>
            <div className="page-head" style={{marginBottom:8}}>
              <div><div className="eyebrow">VERIFIED INFORMATION</div><h2 style={{margin:'5px 0 0',fontSize:20}}>Latest updates</h2></div>
              <Link href="/app/updates" className="btn btn-ghost">See all</Link>
            </div>
            {updates?.length ? (
              <div className="list">{updates.map(update=><Link href={`/app/updates/${update.id}`} className="list-item" key={update.id}>
                <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span className={`badge ${update.priority==='urgent'?'bad':update.priority==='important'?'warn':'good'}`}>{update.priority}</span><span className="muted" style={{fontSize:11}}>{update.category}</span></div>
                <strong style={{display:'block',marginTop:8}}>{update.title}</strong>
                <div className="muted" style={{marginTop:4,lineHeight:1.45,fontSize:13}}>{update.summary}</div>
              </Link>)}</div>
            ) : <div className="notice" style={{marginTop:18}}>No verified updates are available yet.</div>}
          </div>
        </div>
      </section>
    </div>
  )
}
