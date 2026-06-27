import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || '登入失敗')
    localStorage.setItem('token', data.token)
    localStorage.setItem('email', data.email)
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #E1F5EE 0%, #E6F1FB 100%)' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 1rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ width:52, height:52, background:'#0F6E56', borderRadius:14, display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <i className="ti ti-activity-heartbeat" style={{ color:'#E1F5EE', fontSize:28 }}></i>
            </div>
            <div style={{ fontSize:22, fontWeight:600, color:'#0F172A' }}>SportMed AI</div>
            <div style={{ fontSize:13, color:'#64748B', marginTop:3 }}>運動治療評估診斷系統</div>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom:14 }}><i className="ti ti-alert-circle"></i>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:12 }}>
              <label className="label">管理員信箱</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus />
            </div>
            <div style={{ marginBottom:20 }}>
              <label className="label">密碼</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'11px' }} disabled={loading}>
              {loading ? <><div className="spinner"></div>登入中...</> : <><i className="ti ti-login"></i>登入</>}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', fontSize:12, color:'#94A3B8', marginTop:12 }}>
          基於Cyriax評估方法 · 軟組織鬆動術 · 紅繩技術 · 普拉提
        </p>
      </div>
    </div>
  )
}
