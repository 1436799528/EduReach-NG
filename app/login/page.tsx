'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false)
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setError('');const supabase=createClient();const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else window.location.href='/app';setLoading(false)}
  return <main className="container" style={{maxWidth:520,paddingTop:70}}><Link href="/" className="logo">EduReach <span>Hub</span></Link><div className="card" style={{marginTop:25}}><h1 style={{fontSize:34}}>Welcome back</h1><p className="muted">Sign in to continue.</p><form className="form" onSubmit={submit}><div className="field"><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>{error&&<div className="badge bad">{error}</div>}<button className="btn btn-primary" disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><p className="muted">No account? <Link href="/signup" style={{color:'var(--brand)',fontWeight:700}}>Create one</Link></p></div></main>
}
