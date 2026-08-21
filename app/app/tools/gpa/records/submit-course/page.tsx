'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SubmitCoursePage() {
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({ course_code: '', course_title: '', units: 3, level: 200, semester: 1, source_url: '', source_note: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const db = createClient()
      const { data: { user } } = await db.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await db.from('profiles').select('institution_id,faculty,department,programme_id').eq('id', user.id).maybeSingle()
      setProfile({ ...data, user_id: user.id })
      setLoading(false)
    })()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    if (!profile?.user_id) return
    const db = createClient()
    const { error } = await db.from('course_submissions').insert({
      ...form,
      institution_id: profile.institution_id || null,
      department_id: null,
      programme_id: profile.programme_id || null,
      submitter_id: profile.user_id,
      status: 'pending'
    })
    setMessage(error ? 'We could not submit the course. Please try again.' : 'Course submitted for verification.')
    if (!error) setForm({ course_code: '', course_title: '', units: 3, level: 200, semester: 1, source_url: '', source_note: '' })
  }

  if (loading) return <div className="service-card-container">Loading…</div>

  return <div>
    <section className="service-card-container" style={{ background: 'var(--primary-navy)', color: '#fff', border: 0, marginBottom: 20 }}>
      <div className="eyebrow" style={{ color: '#ffd2b9' }}>COURSE CATALOGUE</div>
      <h1 style={{ color: '#fff', margin: '8px 0' }}>Add a course</h1>
      <p style={{ color: '#e8eef9', margin: 0, maxWidth: 700, lineHeight: 1.6 }}>Can't find your school-specific course? Send it here.</p>
    </section>

    <form className="service-card-container form" onSubmit={submit}>
      <div className="grid grid-2">
        <div className="field"><label>Course code</label><input required value={form.course_code} onChange={e => setForm({ ...form, course_code: e.target.value.toUpperCase() })} placeholder="EEE 321" /></div>
        <div className="field"><label>Course title</label><input required value={form.course_title} onChange={e => setForm({ ...form, course_title: e.target.value })} placeholder="Course title" /></div>
      </div>
      <div className="grid grid-3">
        <div className="field"><label>Credit units</label><input type="number" min="1" max="10" value={form.units} onChange={e => setForm({ ...form, units: Number(e.target.value) })} /></div>
        <div className="field"><label>Level</label><select value={form.level} onChange={e => setForm({ ...form, level: Number(e.target.value) })}>{[100,200,300,400,500].map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>Semester</label><select value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}><option value={1}>1st</option><option value={2}>2nd</option></select></div>
      </div>
      <div className="field"><label>Source link (optional)</label><input value={form.source_url} onChange={e => setForm({ ...form, source_url: e.target.value })} placeholder="School handbook / course outline" /></div>
      <div className="field"><label>Source note (optional)</label><textarea rows={4} value={form.source_note} onChange={e => setForm({ ...form, source_note: e.target.value })} placeholder="Where this course appears in your school curriculum" /></div>
      {message && <div className="notice">{message}</div>}
      <button className="btn btn-primary">Submit course</button>
    </form>
  </div>
}
