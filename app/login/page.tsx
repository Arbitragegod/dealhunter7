'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
  }

  const inp = {width:'100%',padding:'0.75rem 1rem',border:'1px solid #ddd',borderRadius:'8px',fontSize:'0.95rem',background:'#fff'} as React.CSSProperties

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9f9f8',padding:'2rem'}}>
      <div style={{background:'#fff',borderRadius:'16px',padding:'2.5rem',width:'100%',maxWidth:'420px',border:'1px solid #eee'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'1.3rem',fontWeight:700,marginBottom:'0.5rem'}}>Deal<span style={{color:'#1D9E75'}}>Hunter</span></div>
          <p style={{color:'#666',fontSize:'0.9rem'}}>Welcome back</p>
        </div>
        <button onClick={handleGoogle} style={{...inp,display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',fontWeight:500,cursor:'pointer',marginBottom:'1.25rem'}}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
          Continue with Google
        </button>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.25rem'}}>
          <div style={{flex:1,height:'1px',background:'#eee'}}/>
          <span style={{fontSize:'0.8rem',color:'#aaa'}}>or with email</span>
          <div style={{flex:1,height:'1px',background:'#eee'}}/>
        </div>
        <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required/>
          <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required/>
          {error && <div style={{background:'#fef2f2',color:'#dc2626',padding:'0.75rem',borderRadius:'8px',fontSize:'0.875rem'}}>{error}</div>}
          <button type="submit" disabled={loading} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0.875rem',borderRadius:'8px',fontWeight:600,fontSize:'1rem'}}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1.5rem',fontSize:'0.875rem',color:'#666'}}>
          No account? <Link href="/signup" style={{color:'#1D9E75',fontWeight:500}}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
