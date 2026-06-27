import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import ResultDisplay from '@/components/ResultDisplay'

const SAMPLES = [
  '病患主訴右肩外展時疼痛，約在60至120度弧度最明顯（painful arc），被動活動疼痛輕於主動，等長收縮外展及外旋誘發疼痛，請評估診斷並給予處置方案。',
  '病患下背痛伴右腿放射麻木，直腿抬高陽性約50度，前彎加劇，請Cyriax脊椎評估並建議處置。',
  '病患右肘外側疼痛，Cozen測試陽性，等長收縮伸腕疼痛最明顯，請評估網球肘並處置。'
]

export default function Dashboard() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [view, setView] = useState<'home' | 'client'>('home')

  // Client list
  const [clients, setClients] = useState<any[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [newClientName, setNewClientName] = useState('')
  const [creatingClient, setCreatingClient] = useState(false)

  // Current client
  const [currentClient, setCurrentClient] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])

  // New session form
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10))
  const [sessionNumber, setSessionNumber] = useState(1)
  const [inputText, setInputText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  // Feedback
  const [feedbackSessionId, setFeedbackSessionId] = useState('')
  const [feedbackDate, setFeedbackDate] = useState(new Date().toISOString().slice(0, 10))
  const [feedbackText, setFeedbackText] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('token')
    const e = localStorage.getItem('email')
    if (!t) { router.push('/'); return }
    setToken(t); setEmail(e || '')
    fetchClients(t)
  }, [])

  const authHeaders = (t: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${t}`
  })

  async function fetchClients(t: string, search = '') {
    const res = await fetch(`/api/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
      headers: authHeaders(t)
    })
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setClients(Array.isArray(data) ? data : [])
  }

  async function createClient() {
    if (!newClientName.trim()) return
    setCreatingClient(true)
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: newClientName.trim() })
    })
    const data = await res.json()
    setCreatingClient(false)
    setNewClientName('')
    fetchClients(token)
    openClient(data)
  }

  async function openClient(client: any) {
    const res = await fetch(`/api/clients/${client.id}`, { headers: authHeaders(token) })
    const data = await res.json()
    setCurrentClient(data.client)
    setSessions(data.sessions || [])
    setView('client')
    setInputText('')
    setAnalyzeError('')
    setFeedbackSessionId('')
    // auto session number
    setSessionNumber((data.sessions?.length || 0) + 1)
  }

  async function analyze() {
    if (!inputText.trim()) return
    setAnalyzing(true); setAnalyzeError('')
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        client_id: currentClient.id,
        session_date: sessionDate,
        session_number: sessionNumber,
        input_text: inputText
      })
    })
    const data = await res.json()
    setAnalyzing(false)
    if (!res.ok) return setAnalyzeError(data.error || '分析失敗')
    // Refresh
    openClient(currentClient)
    setInputText('')
  }

  async function submitFeedback(sessionId: string) {
    if (!feedbackText.trim()) return
    setSubmittingFeedback(true); setFeedbackError('')
    const res = await fetch('/api/feedbacks', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        session_id: sessionId,
        feedback_date: feedbackDate,
        feedback_text: feedbackText
      })
    })
    const data = await res.json()
    setSubmittingFeedback(false)
    if (!res.ok) return setFeedbackError(data.error || '提交失敗')
    setFeedbackText(''); setFeedbackSessionId('')
    openClient(currentClient)
  }

  function logout() {
    localStorage.clear(); router.push('/')
  }

  // ─── Layout ───────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC' }}>
      {/* Top Nav */}
      <nav style={{ background:'white', borderBottom:'1px solid #E2E8F0', padding:'0 1.5rem', height:56, display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
          <div style={{ width:32, height:32, background:'#0F6E56', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ti ti-activity-heartbeat" style={{ color:'#E1F5EE', fontSize:18 }}></i>
          </div>
          <span style={{ fontWeight:600, fontSize:16 }}>SportMed AI</span>
          {view === 'client' && currentClient && <>
            <span style={{ color:'#CBD5E1' }}>/</span>
            <span style={{ color:'#0F6E56', fontWeight:500 }}>{currentClient.name}</span>
          </>}
        </div>
        <span style={{ fontSize:12, color:'#94A3B8' }}>{email}</span>
        {view === 'client' && (
          <button className="btn-secondary" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => setView('home')}>
            <i className="ti ti-arrow-left"></i> 返回
          </button>
        )}
        <button className="btn-secondary" style={{ fontSize:12, padding:'5px 10px' }} onClick={logout}>
          <i className="ti ti-logout"></i> 登出
        </button>
      </nav>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'1.5rem 1rem' }}>

        {/* ── HOME VIEW ── */}
        {view === 'home' && <>
          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>客戶管理</h1>
            <p style={{ fontSize:13, color:'#64748B' }}>選擇或建立客戶，開始評估診斷</p>
          </div>

          {/* Create client */}
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-body">
              <div className="section-title"><i className="ti ti-user-plus"></i> 新增客戶</div>
              <div style={{ display:'flex', gap:8 }}>
                <input value={newClientName} onChange={e => setNewClientName(e.target.value)}
                  placeholder="輸入客戶姓名"
                  onKeyDown={e => e.key === 'Enter' && createClient()} />
                <button className="btn-primary" onClick={createClient} disabled={creatingClient || !newClientName.trim()}
                  style={{ whiteSpace:'nowrap' }}>
                  {creatingClient ? <div className="spinner"></div> : <i className="ti ti-plus"></i>}
                  建立
                </button>
              </div>
            </div>
          </div>

          {/* Search & list */}
          <div className="card">
            <div className="card-header">
              <i className="ti ti-users" style={{ color:'#0F6E56' }}></i>
              <span style={{ fontWeight:500, flex:1 }}>客戶列表 ({clients.length})</span>
              <input value={clientSearch}
                onChange={e => { setClientSearch(e.target.value); fetchClients(token, e.target.value) }}
                placeholder="搜尋客戶..." style={{ width:180 }} />
            </div>
            <div style={{ maxHeight:480, overflowY:'auto' }}>
              {clients.length === 0 ? (
                <div style={{ padding:'2rem', textAlign:'center', color:'#94A3B8', fontSize:14 }}>
                  尚無客戶資料，請先新增客戶
                </div>
              ) : clients.map(c => (
                <div key={c.id}
                  onClick={() => openClient(c)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:'1px solid #F1F5F9', cursor:'pointer', transition:'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  <div style={{ width:36, height:36, background:'#E1F5EE', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:600, color:'#0F6E56', flexShrink:0 }}>
                    {c.name.slice(0, 1)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:'#94A3B8' }}>建立於 {new Date(c.created_at).toLocaleDateString('zh-TW')}</div>
                  </div>
                  <i className="ti ti-chevron-right" style={{ color:'#CBD5E1' }}></i>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* ── CLIENT VIEW ── */}
        {view === 'client' && currentClient && <>
          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:20, fontWeight:600, marginBottom:2 }}>{currentClient.name}</h1>
            <p style={{ fontSize:13, color:'#64748B' }}>共 {sessions.length} 次診斷記錄</p>
          </div>

          {/* New session form */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="card-header">
              <i className="ti ti-brain" style={{ color:'#0F6E56', fontSize:18 }}></i>
              <span style={{ fontWeight:500 }}>新增評估診斷</span>
            </div>
            <div className="card-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div>
                  <label className="label">診斷日期</label>
                  <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">第幾次診斷</label>
                  <input type="number" min={1} value={sessionNumber} onChange={e => setSessionNumber(Number(e.target.value))} />
                </div>
              </div>
              <label className="label">症狀描述</label>
              <textarea value={inputText} onChange={e => setInputText(e.target.value)}
                placeholder="描述症狀、部位、動作發現或評估問題..."
                style={{ minHeight:100, marginBottom:8, resize:'vertical' }} />
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                {SAMPLES.map((s, i) => (
                  <span key={i} onClick={() => setInputText(s)}
                    style={{ fontSize:11, padding:'3px 8px', borderRadius:14, background:'#E1F5EE', color:'#0F6E56', border:'0.5px solid #1D9E75', cursor:'pointer' }}>
                    範例 {i + 1}
                  </span>
                ))}
              </div>
              {analyzeError && <div className="alert alert-danger" style={{ marginBottom:8 }}><i className="ti ti-alert-circle"></i>{analyzeError}</div>}
              <button className="btn-primary" onClick={analyze} disabled={analyzing || !inputText.trim()}>
                {analyzing ? <><div className="spinner"></div>AI分析中...</> : <><i className="ti ti-brain"></i>開始評估分析</>}
              </button>
            </div>
          </div>

          {/* Sessions history */}
          {sessions.map((s: any) => (
            <div key={s.id} className="card" style={{ marginBottom:16 }}>
              <div className="card-header">
                <i className="ti ti-clipboard-text" style={{ color:'#185FA5', fontSize:17 }}></i>
                <span style={{ fontWeight:500, flex:1 }}>
                  第 {s.session_number} 次診斷
                  <span style={{ fontSize:12, color:'#94A3B8', marginLeft:8 }}>{s.session_date}</span>
                </span>
                {s.result_json?.diagnosis?.primary && (
                  <span className="badge badge-green">{s.result_json.diagnosis.primary.slice(0, 20)}...</span>
                )}
              </div>
              <div className="card-body">
                <div style={{ background:'#F8FAFC', border:'0.5px solid #E2E8F0', borderRadius:7, padding:'10px 12px', fontSize:13, color:'#475569', marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#94A3B8', marginBottom:4 }}>輸入內容</div>
                  {s.input_text}
                </div>

                {s.result_json && <ResultDisplay result={s.result_json} />}

                {/* Feedbacks */}
                {s.feedbacks?.map((f: any, fi: number) => (
                  <div key={f.id} style={{ marginTop:16, borderTop:'1px dashed #E2E8F0', paddingTop:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                      <i className="ti ti-messages" style={{ color:'#3C3489', fontSize:16 }}></i>
                      <span style={{ fontWeight:500, fontSize:14 }}>反饋 #{fi + 1}</span>
                      <span style={{ fontSize:12, color:'#94A3B8' }}>{f.feedback_date}</span>
                    </div>
                    <div style={{ background:'#EEEDFE', border:'0.5px solid #C4C2F4', borderRadius:7, padding:'10px 12px', fontSize:13, color:'#3C3489', marginBottom:10 }}>
                      {f.feedback_text}
                    </div>
                    {f.followup_result_json && <>
                      <div style={{ fontSize:12, fontWeight:600, color:'#64748B', marginBottom:8 }}>
                        <i className="ti ti-refresh"></i> 根據反饋更新的評估診斷：
                      </div>
                      <ResultDisplay result={f.followup_result_json} />
                    </>}
                  </div>
                ))}

                {/* Add feedback */}
                {feedbackSessionId === s.id ? (
                  <div style={{ marginTop:16, background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:14 }}>
                    <div style={{ fontWeight:500, fontSize:14, marginBottom:10 }}>
                      <i className="ti ti-message-plus"></i> 新增反饋意見
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:8 }}>
                      <div>
                        <label className="label">反饋日期</label>
                        <input type="date" value={feedbackDate} onChange={e => setFeedbackDate(e.target.value)} />
                      </div>
                    </div>
                    <label className="label">反饋內容（治療後狀況、改善程度、新症狀等）</label>
                    <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                      placeholder="描述治療後的變化、客戶的感受、需要調整的方向..."
                      style={{ minHeight:80, marginBottom:8, resize:'vertical' }} />
                    {feedbackError && <div className="alert alert-danger" style={{ marginBottom:8 }}><i className="ti ti-alert-circle"></i>{feedbackError}</div>}
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn-primary" onClick={() => submitFeedback(s.id)} disabled={submittingFeedback || !feedbackText.trim()}>
                        {submittingFeedback ? <><div className="spinner"></div>AI重新評估中...</> : <><i className="ti ti-brain"></i>提交並重新評估</>}
                      </button>
                      <button className="btn-secondary" onClick={() => { setFeedbackSessionId(''); setFeedbackText(''); setFeedbackError('') }}>
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn-secondary" style={{ marginTop:12, fontSize:12 }}
                    onClick={() => { setFeedbackSessionId(s.id); setFeedbackText(''); setFeedbackError('') }}>
                    <i className="ti ti-message-plus"></i> 新增反饋意見
                  </button>
                )}
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div style={{ textAlign:'center', padding:'2rem', color:'#94A3B8', fontSize:14 }}>
              尚無診斷記錄，請在上方輸入症狀開始評估
            </div>
          )}
        </>}
      </div>
    </div>
  )
}
