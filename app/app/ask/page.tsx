'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Solution={id:string;title:string;category:string;keywords:string[];problem:string;answer:string;action_label:string|null;action_url:string|null;source_url:string|null;source_label:string|null}
const quick=[['Suspension','suspension'],['Late registration','late registration'],['JAMB','jamb'],['SIWES','siwes'],['CGPA','cgpa'],['Clearance','clearance']]

export default function AskPage(){
  const db=useMemo(()=>createClient(),[])
  const [solutions,setSolutions]=useState<Solution[]>([])
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(true)
  useEffect(()=>{db.from('ask_solutions').select('id,title,category,keywords,problem,answer,action_label,action_url,source_url,source_label').eq('is_active',true).eq('verification_status','verified').order('title').then(({data})=>{setSolutions(data||[]);setLoading(false)})},[db])
  const matches=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return solutions;const terms=q.split(/\s+/).filter(Boolean);return solutions.filter(s=>{const hay=[s.title,s.category,s.problem,s.answer,...(s.keywords||[])].join(' ').toLowerCase();return terms.every(t=>hay.includes(t))})},[query,solutions])
  return <div>
    <section className="service-card-container" style={{background:'var(--primary-navy)',color:'#fff',border:0,marginBottom:18}}><div className="eyebrow" style={{color:'#ffd2b9'}}>ASK</div><h1 style={{color:'#fff',margin:'7px 0'}}>What is your school problem?</h1><div className="field" style={{marginTop:18}}><input aria-label="Search a school problem" value={query} onChange={e=>setQuery(e.target.value)} placeholder="late registration, suspension letter, JAMB" style={{background:'#fff',color:'var(--text-dark)',border:0}}/></div></section>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>{quick.map(([label,value])=><button key={value} className="btn btn-ghost" onClick={()=>setQuery(value)}>{label}</button>)}</div>
    <div className="page-head"><div><div className="eyebrow">SOLUTIONS</div><h2 style={{margin:'5px 0 0',fontSize:22}}>{query?`${matches.length} result${matches.length===1?'':'s'}`:'Common student problems'}</h2></div></div>
    {loading?<div className="service-card-container"><strong>Loading solutions…</strong></div>:<div className="grid grid-2">{matches.map(s=><article className="service-card-container" key={s.id}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}><span className="badge">{s.category}</span><span className="badge good">VERIFIED</span></div><h3 className="service-title" style={{marginTop:12,textTransform:'none'}}>{s.title}</h3><div style={{fontWeight:800,color:'var(--primary-navy)',marginTop:8}}>{s.problem}</div><p className="service-description" style={{marginTop:8,lineHeight:1.6}}>{s.answer}</p><div className="actions" style={{marginTop:14}}>{s.action_url&&<Link className="btn btn-primary" href={s.action_url}>{s.action_label||'Open solution'} →</Link>}{s.source_url&&<a className="btn btn-secondary" href={s.source_url} target="_blank" rel="noreferrer">{s.source_label||'Official source'} ↗</a>}</div></article>)}</div>}
    {!loading&&!matches.length&&<div className="service-card-container"><h3 style={{color:'var(--primary-navy)'}}>No direct match yet.</h3><p className="muted" style={{marginBottom:0}}>Try words like <strong>registration</strong>, <strong>SIWES</strong>, <strong>JAMB</strong>, <strong>fees</strong> or <strong>result</strong>.</p></div>}
  </div>
}
