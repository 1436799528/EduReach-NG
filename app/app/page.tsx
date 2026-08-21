import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const actions = [
  ['edit_note','Write','Letters, appeals, requests','/app/write'],
  ['search','Find','School, JAMB, admission','/app/search'],
  ['notifications','Check','Notices, exams, deadlines','/app/updates'],
  ['calculate','Calculate','GPA, CGPA, targets','/app/tools/gpa'],
  ['folder_open','Get','Past questions, forms, links','/app/resources'],
  ['help','Ask','School problems and answers','/app/ask'],
]

const format = (v: string | null) => v
  ? new Intl.DateTimeFormat('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(v))
  : 'No deadline'

export default async function Dashboard() {
  const s = await createClient()
  const { data: { user } } = await s.auth.getUser()
  const [{ data: profile }, { data: updates }, { data: tasks }, { count: courseCount }] = await Promise.all([
    s.from('profiles').select('full_name,school,level,department').eq('id', user!.id).maybeSingle(),
    s.from('edureach_announcements').select('id,title,summary,category,priority,published_at').eq('verification_status', 'verified').not('published_at', 'is', null).order('published_at', { ascending: false }).limit(6),
    s.from('edureach_tasks').select('id,title,due_at,priority').eq('user_id', user!.id).eq('status', 'pending').order('due_at', { ascending: true }).limit(4),
    s.from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true).eq('verification_status', 'verified')
  ])

  const first = profile?.full_name?.trim().split(/\s+/)[0] || 'Student'
  const latest = updates?.[0]

  return <div className="dashboard-page">
    <section className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <div className="eyebrow" style={{ color: 'var(--secondary-orange)' }}>MY DESK</div>
        <h1>Hi {first}, what do you need?</h1>
        <div className="dashboard-context">
          <span className="badge"><span className="material-symbols-rounded icon-sm">school</span>{profile?.school || 'Add your school'}</span>
          {profile?.level && <span className="badge"><span className="material-symbols-rounded icon-sm">layers</span>{profile.level} Level</span>}
          {profile?.department && <span className="badge"><span className="material-symbols-rounded icon-sm">account_tree</span>{profile.department}</span>}
        </div>
      </div>
      <Link href="/app/search" className="dashboard-hero-search">
        <span className="material-symbols-rounded">search</span>
        <span>Search EduReach</span>
        <span className="material-symbols-rounded icon-sm">arrow_forward</span>
      </Link>
    </section>

    {latest && <section className="pulse-card">
      <div className="pulse-mark"><span className="material-symbols-rounded">campaign</span></div>
      <div className="pulse-content">
        <div className="eyebrow">STUDENT PULSE</div>
        <Link href={`/app/updates/${latest.id}`} className="pulse-title">{latest.title}</Link>
        <span className="pulse-meta">{latest.category} · {latest.priority}</span>
      </div>
      <Link href={`/app/updates/${latest.id}`} className="icon-button" aria-label="Open notice"><span className="material-symbols-rounded">arrow_forward</span></Link>
    </section>}

    <div className="page-head dashboard-section-head">
      <div><div className="eyebrow">START HERE</div><h2>Get something done</h2></div>
      <span className="dashboard-count"><span className="material-symbols-rounded icon-sm">menu_book</span>{courseCount || 0} verified courses</span>
    </div>

    <div className="dashboard-action-rail">
      {actions.map(([icon, title, text, href], i) => <Link href={href} className={`action-tile ${i === 0 || i === 5 ? 'accent' : ''}`} key={title}>
        <span className="action-icon"><span className="material-symbols-rounded">{icon}</span></span>
        <span className="action-copy"><strong>{title}</strong><small>{text}</small></span>
        <span className="material-symbols-rounded action-arrow">arrow_forward</span>
      </Link>)}
    </div>

    <div className="dashboard-grid">
      <section className="service-card-container dashboard-panel">
        <div className="panel-head"><div><div className="eyebrow">YOUR TASKS</div><h3>Things to do</h3></div><Link href="/app/tasks" className="btn btn-ghost">View all</Link></div>
        {tasks?.length ? <div className="list">{tasks.map(t => <Link href="/app/tasks" className="dashboard-list-item" key={t.id}><div><strong>{t.title}</strong><span>{format(t.due_at)}</span></div><span className={`badge ${t.priority === 'urgent' ? 'bad' : t.priority === 'high' ? 'warn' : ''}`}>{t.priority}</span></Link>)}</div> : <div className="empty-inline"><span className="material-symbols-rounded">task_alt</span><span>No pending task.</span><Link href="/app/tasks">Add one</Link></div>}
      </section>

      <section className="service-card-container dashboard-panel">
        <div className="panel-head"><div><div className="eyebrow">LATEST</div><h3>School notices</h3></div><Link href="/app/updates" className="btn btn-ghost">See all</Link></div>
        {updates?.length ? <div className="notice-rail">{updates.map(u => <Link href={`/app/updates/${u.id}`} className="notice-tile" key={u.id}><span className={`notice-dot ${u.priority}`} /><div><strong>{u.title}</strong><span>{u.category} · {u.priority}</span></div></Link>)}</div> : <div className="empty-inline"><span className="material-symbols-rounded">campaign</span><span>No verified notices yet.</span></div>}
      </section>
    </div>

    <section className="dashboard-strip">
      <div><div className="eyebrow">KEEP EXPLORING</div><h3>Useful right now</h3></div>
      <div className="mini-rail">
        <Link href="/app/courses" className="mini-card"><span className="material-symbols-rounded">menu_book</span><div><strong>Course Finder</strong><small>Find a course fast</small></div></Link>
        <Link href="/app/school/academics" className="mini-card"><span className="material-symbols-rounded">account_tree</span><div><strong>Academic Catalogue</strong><small>Faculty to course</small></div></Link>
        <Link href="/app/tools/gpa" className="mini-card"><span className="material-symbols-rounded">calculate</span><div><strong>GPA Calculator</strong><small>Calculate only</small></div></Link>
        <Link href="/app/write" className="mini-card"><span className="material-symbols-rounded">edit_note</span><div><strong>Write a Letter</strong><small>HOD, Dean, SIWES</small></div></Link>
      </div>
    </section>
  </div>
}
