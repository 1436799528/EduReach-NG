'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { analyzeTarget, computeGPA, letterToPoints, scoreToGrade, round2 } from '@/lib/gpa/engine';
import { GpaError } from '@/lib/gpa/types';
import { GRADING_SCHEMES, getScheme } from '@/lib/gpa/schemes';

interface Row {
  id: number;
  name: string;
  creditUnits: string;
  mode: 'grade' | 'score';
  grade: string;
  score: string;
}

let rowId = 0;
const newRow = (): Row => ({ id: ++rowId, name: '', creditUnits: '3', mode: 'grade', grade: 'A', score: '' });

export function GpaCalculator() {
  const [schemeKey, setSchemeKey] = useState(GRADING_SCHEMES[0]!.key);
  const [rows, setRows] = useState<Row[]>([newRow(), newRow(), newRow(), newRow()]);
  const scheme = getScheme(schemeKey);

  const result = useMemo(() => {
    const courses = [];
    for (const r of rows) {
      const units = Number(r.creditUnits);
      if (!r.creditUnits || Number.isNaN(units)) continue;
      let points: number;
      try {
        points = r.mode === 'grade'
          ? letterToPoints(r.grade, scheme)
          : scoreToGrade(Number(r.score), scheme).points;
      } catch {
        continue;
      }
      courses.push({ creditUnits: units, gradePoints: points, name: r.name });
    }
    if (courses.length === 0) return null;
    try {
      return computeGPA(courses, scheme.maxPoints);
    } catch (e) {
      if (e instanceof GpaError) return { error: e.message } as const;
      return null;
    }
  }, [rows, scheme]);

  function patch(id: number, partial: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...partial } : r)));
  }

  const gpaResult = result && !('error' in result) ? result : null;
  const errorMsg = result && 'error' in result ? result.error : '';

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row row--wrap">
        <div className="field" style={{ marginBottom: 0, minWidth: 220 }}>
          <label htmlFor="scheme">Grading scale</label>
          <select id="scheme" value={schemeKey} onChange={(e) => setSchemeKey(e.target.value)}>
            {GRADING_SCHEMES.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
          </select>
        </div>
        <span className="small muted">
          Scale guide: {scheme.bands.map((b) => `${b.letter}=${b.points}`).join(' · ')}
        </span>
      </div>

      <div>
        {rows.map((r, i) => (
          <div key={r.id} className="chip-input-row mb-1">
            <input
              aria-label={`Course ${i + 1} name`}
              placeholder={`Course ${i + 1} (optional name)`}
              value={r.name}
              onChange={(e) => patch(r.id, { name: e.target.value })}
            />
            <input
              aria-label="Credit units"
              type="number" min={1} max={30}
              placeholder="Units"
              value={r.creditUnits}
              onChange={(e) => patch(r.id, { creditUnits: e.target.value })}
            />
            <select
              aria-label="Grade or score entry"
              value={r.mode}
              onChange={(e) => patch(r.id, { mode: e.target.value as 'grade' | 'score' })}
            >
              <option value="grade">By grade</option>
              <option value="score">By score</option>
            </select>
            {r.mode === 'grade' ? (
              <select aria-label="Grade" value={r.grade} onChange={(e) => patch(r.id, { grade: e.target.value })}>
                {scheme.bands.map((b) => <option key={b.letter} value={b.letter}>{b.letter}</option>)}
              </select>
            ) : (
              <input
                aria-label="Score out of 100"
                type="number" min={0} max={100} placeholder="Score /100"
                value={r.score}
                onChange={(e) => patch(r.id, { score: e.target.value })}
              />
            )}
            <button
              type="button"
              className="btn btn--danger-outline btn--sm"
              aria-label="Remove course"
              onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.id !== r.id) : rs))}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="btn btn--outline btn--sm mt-1" onClick={() => setRows((rs) => [...rs, newRow()])}>
          + Add course
        </button>
      </div>

      {errorMsg ? <div className="form-error" role="alert">{errorMsg}</div> : null}

      {gpaResult ? (
        <div className={`result-card ${gpaResult.gpa >= 3.5 ? 'result-card--ok' : gpaResult.gpa >= 2 ? 'result-card--warn' : 'result-card--bad'}`}>
          <div className="small muted">Your semester GPA</div>
          <div className="big">{gpaResult.gpa.toFixed(2)}</div>
          <div className="small muted">
            {gpaResult.qualityPoints} quality points · {gpaResult.totalUnits} credit units · {scheme.name}
          </div>
        </div>
      ) : (
        <div className="result-card" style={{ background: 'var(--bg)', border: '1px dashed var(--line-strong)' }}>
          <div className="small muted">Enter your courses to see your GPA</div>
        </div>
      )}

      <p className="small muted" style={{ margin: 0 }}>
        GPA = Σ(units × grade points) ÷ Σ(units). Calculations are exact; rounding happens only for display (2 d.p.).
        Always confirm your school&apos;s official scale — some departments differ.
      </p>
      <p className="small" style={{ margin: 0 }}>
        Targeting a class? Try the <Link href="/tools/cgpa-target">Can I Still Get This CGPA?</Link> tool next.
      </p>
    </div>
  );
}

export function CgpaTargetTool() {
  const [current, setCurrent] = useState('');
  const [done, setDone] = useState('');
  const [remaining, setRemaining] = useState('');
  const [target, setTarget] = useState('');
  const [schemeKey, setSchemeKey] = useState(GRADING_SCHEMES[0]!.key);
  const scheme = getScheme(schemeKey);

  const outcome = useMemo(() => {
    if (!current || !remaining || !target) return null;
    try {
      return analyzeTarget({
        currentCgpa: Number(current),
        completedUnits: Number(done || 0),
        remainingUnits: Number(remaining),
        targetCgpa: Number(target),
        maxPoints: scheme.maxPoints
      });
    } catch (e) {
      return e instanceof GpaError ? ({ error: e.message } as const) : null;
    }
  }, [current, done, remaining, target, scheme.maxPoints]);

  const good = outcome && !('error' in outcome) && outcome.possible && outcome.verdict !== 'VERY_HARD';
  const hardBut = outcome && !('error' in outcome) && outcome.possible && outcome.verdict === 'VERY_HARD';
  const bad = outcome && !('error' in outcome) && !outcome.possible;

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="cur" className="req">Current CGPA</label>
          <input id="cur" type="number" min={0} max={7} step="0.01" placeholder="e.g. 3.05" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="done" className="req">Units completed</label>
          <input id="done" type="number" min={0} max={400} placeholder="e.g. 90" value={done} onChange={(e) => setDone(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="rem" className="req">Units remaining</label>
          <input id="rem" type="number" min={1} max={400} placeholder="e.g. 45" value={remaining} onChange={(e) => setRemaining(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="tgt" className="req">Target CGPA</label>
          <input id="tgt" type="number" min={0} max={7} step="0.01" placeholder="e.g. 3.50" value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="sch">Scale</label>
          <select id="sch" value={schemeKey} onChange={(e) => setSchemeKey(e.target.value)}>
            {GRADING_SCHEMES.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {outcome && 'error' in outcome ? <div className="form-error" role="alert">{outcome.error}</div> : null}

      {outcome && !('error' in outcome) ? (
        <>
          <div className={`result-card ${good ? 'result-card--ok' : hardBut ? 'result-card--warn' : bad ? 'result-card--bad' : 'result-card--warn'}`}>
            <div className="small muted">Required average GPA over your remaining {Number(remaining)} units</div>
            <div className="big">{outcome.verdict === 'ALREADY_MET' ? '—' : outcome.requiredGpa.toFixed(2)}</div>
            <div style={{ fontWeight: 700 }}>{outcome.message}</div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem' }}>Scenario check — your final CGPA if…</h3>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Scenario</th><th>Avg. GPA from here</th><th>Final CGPA</th><th>vs target</th></tr></thead>
                <tbody>
                  {outcome.scenarios.map((s) => (
                    <tr key={s.label}>
                      <td>{s.label}</td>
                      <td>{s.averageGpa.toFixed(2)}</td>
                      <td><strong>{s.finalCgpa.toFixed(2)}</strong></td>
                      <td>{s.finalCgpa >= Number(target) ? '✓ meets target' : `${round2(Number(target) - s.finalCgpa).toFixed(2)} short`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="result-card" style={{ background: 'var(--bg)', border: '1px dashed var(--line-strong)' }}>
          <div className="small muted">Fill in the four numbers to run the analysis</div>
        </div>
      )}

      <p className="small muted" style={{ margin: 0 }}>
        The math is exact: required = (target × total units − current × done) ÷ remaining.
        If it says impossible, no amount of wishing changes it — but the tool shows the best you can still finish with.
      </p>
    </div>
  );
}
