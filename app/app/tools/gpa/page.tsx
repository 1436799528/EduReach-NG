'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateGpa, calculateProjectedCgpa, calculateRequiredGpa, targetStatus } from '@/lib/calculations'

type SchemeItem = { grade: string; point: number; min_score: number | null; max_score: number | null }

const emptyRow = { units: 3, point: 5 }

export default function GpaPage() {
  const [scheme, setScheme] = useState<{ name: string; scale: number; items: SchemeItem[] } | null>(null)
  const [rows, setRows] = useState([{ ...emptyRow }, { units: 3, point: 4 }])
  const [current, setCurrent] = useState(3.05)
  const [completed, setCompleted] = useState(90)
  const [remaining, setRemaining] = useState(45)
  const [target, setTarget] = useState(3.5)
  const [futureGpa, setFutureGpa] = useState(4)
  const [futureCredits, setFutureCredits] = useState(15)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const institutionId = userData.user ? (await supabase.from('profiles').select('institution_id').eq('id', userData.user.id).maybeSingle()).data?.institution_id : null
      const schemeQuery = institutionId
        ? supabase.from('grading_schemes').select('name,scale,id').eq('institution_id', institutionId).order('is_default', { ascending: false }).limit(1).maybeSingle()
        : supabase.from('grading_schemes').select('name,scale,id').eq('is_default', true).limit(1).maybeSingle()
      const { data: schemeData } = await schemeQuery
      if (!schemeData) return
      const { data: items } = await supabase.from('grading_scheme_items').select('grade,point,min_score,max_score').eq('grading_scheme_id', schemeData.id).order('point', { ascending: false })
      setScheme({ name: schemeData.name, scale: Number(schemeData.scale), items: (items || []).map((x) => ({ ...x, point: Number(x.point) })) })
      setRows([{ units: 3, point: Number(items?.[0]?.point ?? 5) }, { units: 3, point: Number(items?.[1]?.point ?? 4) }])
    })()
  }, [])

  const scale = scheme?.scale ?? 5
  const gpa = useMemo(() => calculateGpa(rows), [rows])
  const req = calculateRequiredGpa(current, completed, remaining, target)
  const status = req === null ? null : targetStatus(req, scale)
  const projected = calculateProjectedCgpa(current, completed, futureGpa, futureCredits)

  function update(i: number, key: 'units' | 'point', value: number) {
    setRows((currentRows) => currentRows.map((row, index) => index === i ? { ...row, [key]: value } : row))
  }

  function addCourse() {
    setRows((currentRows) => [...currentRows, { units: 2, point: Math.min(3, scale) }])
  }

  return (
    <div>
      <section className="service-card-container" style={{ background: 'var(--primary-navy)', color: '#fff', border: 0, marginBottom: 20 }}>
        <div className="eyebrow" style={{ color: '#ffd2b9' }}>CALCULATE</div>
        <h1 style={{ color: '#fff', margin: '8px 0' }}>GPA, CGPA & targets</h1>
        <span className="badge">{scheme?.name || 'Loading grading scheme…'}</span>
      </section>

      <div className="grid grid-2">
        <div className="service-card-container">
          <div className="eyebrow">SEMESTER GPA</div>
          {rows.map((row, index) => (
            <div className="grid grid-2" key={index} style={{ marginBottom: 10 }}>
              <div className="field">
                <label>Credit unit</label>
                <input type="number" min="1" step="1" value={row.units} onChange={(event) => update(index, 'units', Number(event.target.value))} />
              </div>
              <div className="field">
                <label>Grade point</label>
                <select value={row.point} onChange={(event) => update(index, 'point', Number(event.target.value))}>
                  {(scheme?.items || Array.from({ length: Math.floor(scale) + 1 }, (_, point) => ({ grade: String(point), point, min_score: null, max_score: null }))).map((item) => (
                    <option key={`${item.grade}-${item.point}`} value={item.point}>{item.grade} · {item.point}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addCourse}>+ Add course</button>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(10,34,92,.08)' }}>
            <div className="label">YOUR GPA</div>
            <div style={{ fontSize: 46, fontWeight: 900, color: 'var(--primary-navy)' }}>{gpa.toFixed(2)}</div>
          </div>
        </div>

        <div className="service-card-container">
          <div className="eyebrow">CAN I STILL REACH MY TARGET?</div>
          <div className="form">
            <div className="field"><label>Current CGPA</label><input type="number" step="0.01" min="0" max={scale} value={current} onChange={(e) => setCurrent(Number(e.target.value))} /></div>
            <div className="grid grid-2">
              <div className="field"><label>Completed credits</label><input type="number" min="0" value={completed} onChange={(e) => setCompleted(Number(e.target.value))} /></div>
              <div className="field"><label>Remaining credits</label><input type="number" min="1" value={remaining} onChange={(e) => setRemaining(Number(e.target.value))} /></div>
            </div>
            <div className="field"><label>Target CGPA</label><input type="number" step="0.01" min="0" max={scale} value={target} onChange={(e) => setTarget(Number(e.target.value))} /></div>
          </div>
          {req !== null && (
            <div style={{ marginTop: 20, padding: 18, borderRadius: 12, background: 'var(--bg-light-gray)' }}>
              <div className="label">YOU NEED</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: req <= scale ? 'var(--primary-navy)' : 'var(--secondary-orange)' }}>{req.toFixed(2)}</div>
              <span className={`badge ${status?.tone === 'good' ? 'good' : 'bad'}`}>{status?.label}</span>
            </div>
          )}
        </div>
      </div>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="grid grid-2">
          <div className="service-card-container">
            <div className="eyebrow">WHAT-IF CGPA</div>
            <div className="grid grid-2">
              <div className="field"><label>Future GPA</label><input type="number" step="0.01" min="0" max={scale} value={futureGpa} onChange={(e) => setFutureGpa(Number(e.target.value))} /></div>
              <div className="field"><label>Future credits</label><input type="number" min="1" value={futureCredits} onChange={(e) => setFutureCredits(Number(e.target.value))} /></div>
            </div>
            <div className="label" style={{ marginTop: 16 }}>PROJECTED CGPA</div>
            <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--primary-navy)' }}>{projected === null ? '—' : projected.toFixed(2)}</div>
          </div>

          <div className="service-card-container">
            <div className="eyebrow">GRADING SCALE</div>
            <div className="list">
              {(scheme?.items || []).map((item) => (
                <div className="list-item" key={item.grade} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{item.grade}</strong><span className="badge">{item.point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
