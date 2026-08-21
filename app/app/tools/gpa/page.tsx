'use client'
import { useMemo,useState } from 'react'
import { calculateGpa,calculateRequiredGpa,targetStatus } from '@/lib/calculations'

export default function GpaPage(){
  const [rows,setRows]=useState([{units:3,point:5},{units:3,point:4}])
  const [current,setCurrent]=useState(3.05)
  const [completed,setCompleted]=useState(90)
  const [remaining,setRemaining]=useState(45)
  const [target,setTarget]=useState(3.5)
  const gpa=useMemo(()=>calculateGpa(rows),[rows])
  const req=calculateRequiredGpa(current,completed,remaining,target)
  const status=req===null?null:targetStatus(req,5)
  function update(i:number,k:'units'|'point',v:number){setRows(r=>r.map((x,n)=>n===i?{...x,[k]:v}:x))}
  return <div>
    <section style={{background:'var(--primary-navy)',color:'#fff',borderRadius:18,padding:'30px',marginBottom:22,boxShadow:'0 12px 26px rgba(10,34,92,.12)'}}>
      <div className="eyebrow" style={{color:'#ffd2b9'}}>ACADEMIC CALCULATOR</div>
      <h1 style={{color:'#fff',margin:'8px 0 10px'}}>Know your GPA. Know what you need.</h1>
      <p style={{margin:0,color:'#e8eef9',lineHeight:1.65,maxWidth:720}}>Built for Nigerian tertiary grading workflows. Use your credit units and grade points to check where you stand and what is still possible.</p>
    </section>
    <div className="grid grid-2">
      <div className="service-card-container">
        <div className="eyebrow">01 · SEMESTER RESULT</div><h2 style={{color:'var(--primary-navy)',margin:'7px 0 4px'}}>Calculate GPA</h2>
        <p className="muted">Add the courses on your result sheet, then enter the credit unit and grade point.</p>
        {rows.map((r,i)=><div className="grid grid-2" key={i} style={{marginBottom:10}}><div className="field"><label>Credit unit</label><input type="number" min="1" value={r.units} onChange={e=>update(i,'units',Number(e.target.value))}/></div><div className="field"><label>Grade point</label><input type="number" min="0" max="5" step="0.01" value={r.point} onChange={e=>update(i,'point',Number(e.target.value))}/></div></div>)}
        <button className="btn btn-secondary" style={{borderColor:'rgba(10,34,92,.12)'}} onClick={()=>setRows([...rows,{units:2,point:3}])}>+ Add course</button>
        <div style={{marginTop:22,paddingTop:18,borderTop:'1px solid rgba(10,34,92,.08)',display:'flex',justifyContent:'space-between',alignItems:'end'}}><div><div className="label">Semester GPA</div><div style={{fontSize:42,fontWeight:900,color:'var(--primary-navy)'}}>{gpa.toFixed(2)}</div></div><div className="service-icon-badge" style={{width:44,height:44,background:'var(--secondary-orange)'}}>A</div></div>
      </div>
      <div className="service-card-container">
        <div className="eyebrow">02 · TARGET PLANNING</div><h2 style={{color:'var(--primary-navy)',margin:'7px 0 4px'}}>Can I still reach it?</h2>
        <p className="muted">Use your current CGPA and remaining credits to see the average GPA required.</p>
        <div className="form"><div className="field"><label>Current CGPA</label><input type="number" step="0.01" min="0" max="5" value={current} onChange={e=>setCurrent(Number(e.target.value))}/></div><div className="grid grid-2"><div className="field"><label>Completed credits</label><input type="number" min="0" value={completed} onChange={e=>setCompleted(Number(e.target.value))}/></div><div className="field"><label>Remaining credits</label><input type="number" min="0" value={remaining} onChange={e=>setRemaining(Number(e.target.value))}/></div></div><div className="field"><label>Target CGPA</label><input type="number" step="0.01" min="0" max="5" value={target} onChange={e=>setTarget(Number(e.target.value))}/></div></div>
        {req!==null&&<div style={{marginTop:22,padding:18,borderRadius:14,background:'var(--bg-light-gray)',border:'1px solid rgba(10,34,92,.06)'}}><div className="label">Required average GPA</div><div style={{fontSize:36,fontWeight:900,color:req<=5?'var(--primary-navy)':'var(--secondary-orange)'}}>{req.toFixed(2)}</div><span className={`badge ${status?.tone==='good'?'good':'bad'}`}>{status?.label}</span>{req>5&&<p className="muted" style={{marginBottom:0,marginTop:8}}>This target is mathematically impossible on a 5-point scale with the credits remaining.</p>}</div>}
      </div>
    </div>
  </div>
}
