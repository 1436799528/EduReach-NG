'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AcademicRecordsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({ course_code: '', course_title: '', credit_units: 3, grade: 'A', grade_point: 5, semester: 1 })
  const [message, setMessage] = useState('')

  async function load() {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    const { data } = await supabase.from('academic_records').select('id,course_code,course_title,credit_units,grade,grade_point,semester,created_at').eq('user_id', userData.user.id).order('created_at', { ascending: false })
    setRows(data || [])
  }

  useEffect(() => { load() }, [])

  const totals = useMemo(() => {
    const credits = rows.reduce((sum, row) => sum + Number(row.credit_units || 0), 0)
    const points = rows.reduce((sum, row) => sum + Number(row.credit_units || 0) * Number(row.grade_point || 0), 0)
    return { credits, cgpa: credits ? points / credits : 0 }
  }, [rows])

  async function addRecord(event: React.FormEvent) {
    event.preventDefault()
    setMessage('')
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    const { error } = await supabase.from('academic_records').insert({ ...form, user_id: userData.user.id })
    if (error) setMessage(error.message)
    else { setMessage('Course added.'); setForm({ course_code: '', course_title: '', credit_units: 3, grade: 'A', grade_point: 5, semester: 1 }); load() }
  }

  async function removeRecord(id: string) {
    const supabase = createClient()
    await supabase.from('academic_records').delete().eq('id', id)
    load()
  }

  return <div>
    <section className="service-card-container" style={{ background: 'var(--primary-navy)', color: '#fff', border: 0, marginBottom: 20 }}>
      <div className="eyebrow" style={{ color: '#ffd2b9' }}>ACADEMIC RECORD</div>
      <h1 style={{ color: '#fff', margin: '8px 0' }}>My courses & grades</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span className="badge">{totals.credits} credits</span><span className="badge">CGPA {totals.cgpa.toFixed(2)}</span></div>
    </section>

    <div className="grid grid-2">
      <form className="service-card-container form" onSubmit={addRecord}>
        <div className="eyebrow">ADD COURSE</div>
        <div className="grid grid-2"><div className="field"><label>Course code</label><input required value={form.course_code} onChange={e => setForm({ ...form, course_code: e.target.value.toUpperCase() })} placeholder="EEE 321" /></div><div className="field"><label>Credit units</label><input type="number" min="1" value={form.credit_units} onChange={e => setForm({ ...form, credit_units: Number(e.target.value) })} /></div></div>
        <div className="field"><label>Course title</label><input value={form.course_title} onChange={e => setForm({ ...form, course_title: e.target.value })} placeholder="Electrical Machines" /></div>
        <div className="grid grid-2"><div className="field"><label>Grade</label><select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value, grade_point: ({ A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 } as Record<string, number>)[e.target.value] ?? 0 })}><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option></select></div><div className="field"><label>Semester</label><select value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}><option value={1}>1st</option><option value={2}>2nd</option></select></div></div>
        <button className="btn btn-primary">Save course</button>
        {message && <div className="notice">{message}</div>}
      </form>

      <div className="service-card-container">
        <div className="eyebrow">SAVED RECORDS</div>
        {rows.length ? <div className="list">{rows.map(row => <div className="list-item" key={row.id}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><strong>{row.course_code}</strong><span className="badge">{row.grade}</span></div><div className="muted">{row.course_title || 'Course title not added'} · {row.credit_units} unit{row.credit_units === 1 ? '' : 's'} · {row.semester === 1 ? '1st' : '2nd'} semester</div><button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => removeRecord(row.id)}>Remove</button></div>)}</div> : <div className="notice">No courses saved yet.</div>}
      </div>
    </div>
  </div>
}
