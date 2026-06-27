import { useState } from 'react'

export default function ResultDisplay({ result }: { result: any }) {
  const [tab, setTab] = useState('stm')
  const [diagOpen, setDiagOpen] = useState(true)
  const [treatOpen, setTreatOpen] = useState(true)
  const [refOpen, setRefOpen] = useState(true)

  if (!result) return null
  const d = result.diagnosis || {}
  const t = result.treatment || {}
  const refs = result.references || []
  const ca = d.cyriax_analysis || {}

  const analysisRows = [
    ['主動動作', ca.active_motion], ['被動動作', ca.passive_motion],
    ['等長抗阻', ca.resisted], ['End-feel', ca.end_feel],
    ['組織類型', ca.tissue_type], ['關節囊模式', ca.pattern]
  ].filter(r => r[1])

  function techList(arr: any[], type: string) {
    if (!arr?.length) return <div style={{ color:'#94A3B8', fontSize:13 }}>暫無適用方案</div>
    return (
      <ol className="steps">
        {arr.map((x: any, i: number) => (
          <li key={i}>
            <div>
              <div style={{ fontWeight:500, marginBottom:3 }}>{x.name}</div>
              {type === 'stm' && <>
                <div style={{ fontSize:12, color:'#64748B', marginBottom:3 }}>{x.description}</div>
                <span className="badge badge-green">{x.dosage}</span>
              </>}
              {type === 'red' && <>
                <div style={{ fontSize:12, color:'#64748B' }}>設置：{x.setup}</div>
                <div style={{ fontSize:12, color:'#64748B' }}>執行：{x.execution}</div>
                <span className="badge badge-blue">進階：{x.progression}</span>
              </>}
              {type === 'pil' && <>
                <div style={{ fontSize:12, color:'#64748B' }}>提示：{x.cue}</div>
                <div style={{ fontSize:12, color:'#64748B' }}>修改：{x.modification}</div>
                <span className="badge badge-purple">{x.sets}</span>
              </>}
            </div>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div style={{ display:'grid', gap:12 }}>
      <div className="alert alert-warning">
        <i className="ti ti-alert-triangle"></i>
        <div>本系統提供評估參考，非醫療診斷。所有臨床決策應由持照治療師根據完整評估執行。</div>
      </div>

      {/* Diagnosis Card */}
      <div className="card">
        <div className="card-header collapsible-header" onClick={() => setDiagOpen(o => !o)}>
          <i className="ti ti-stethoscope" style={{ color:'#0F6E56', fontSize:18 }}></i>
          <span style={{ fontWeight:500, flex:1 }}>Cyriax評估診斷結果</span>
          <span className="badge badge-green">{ca.tissue_type || '組織分析'}</span>
          <i className={`ti ti-chevron-${diagOpen ? 'up' : 'down'}`} style={{ color:'#94A3B8' }}></i>
        </div>
        {diagOpen && <div className="card-body" style={{ display:'grid', gap:16 }}>
          <div>
            <div className="section-title">主要診斷</div>
            <div style={{ fontSize:15, fontWeight:600 }}>{d.primary}</div>
            {d.icd_hint && <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{d.icd_hint}</div>}
          </div>
          <div>
            <div className="section-title">選擇性組織張力測試</div>
            <div className="row-grid">
              {analysisRows.map(([lbl, val]) => (
                <div key={lbl} className="row-item">
                  <span className="row-lbl">{lbl}</span>
                  <span className="row-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="section-title">Cyriax推理過程</div>
            <div style={{ fontSize:13, background:'#F8FAFC', padding:'10px 12px', borderRadius:7, borderLeft:'3px solid #1D9E75', lineHeight:1.7 }}>
              {d.reasoning}
            </div>
          </div>
          {d.differential?.length > 0 && (
            <div>
              <div className="section-title">鑑別診斷</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {d.differential.map((x: string, i: number) => (
                  <span key={i} className={`badge ${i === 0 ? 'badge-green' : ''}`}
                    style={i !== 0 ? { background:'#F1F5F9', color:'#475569', border:'0.5px solid #E2E8F0' } : {}}>
                    {x}
                  </span>
                ))}
              </div>
            </div>
          )}
          {d.red_flags?.length > 0 && (
            <div className="alert alert-danger">
              <div>
                <div style={{ fontWeight:600, marginBottom:4 }}>⚠ 警示徵象</div>
                {d.red_flags.map((f: string, i: number) => <div key={i} style={{ fontSize:13 }}>{f}</div>)}
              </div>
            </div>
          )}
        </div>}
      </div>

      {/* Treatment Card */}
      <div className="card">
        <div className="card-header collapsible-header" onClick={() => setTreatOpen(o => !o)}>
          <i className="ti ti-massage" style={{ color:'#185FA5', fontSize:18 }}></i>
          <span style={{ fontWeight:500, flex:1 }}>整合處置方案</span>
          <span className="badge badge-blue">{t.phase || '處置計畫'}</span>
          <i className={`ti ti-chevron-${treatOpen ? 'up' : 'down'}`} style={{ color:'#94A3B8' }}></i>
        </div>
        {treatOpen && <div className="card-body">
          <div className="tab-row">
            {[['stm','手掌','軟組織鬆動術'],['red','yoga','紅繩技術'],['pil','body-scan','普拉提']].map(([k, ic, lbl]) => (
              <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
                <i className={`ti ti-${ic}`}></i> {lbl}
              </button>
            ))}
          </div>
          {tab === 'stm' && t.stm && <>
            <div style={{ fontSize:13, color:'#64748B', marginBottom:10 }}>{t.stm.rationale}</div>
            {techList(t.stm.techniques, 'stm')}
          </>}
          {tab === 'red' && t.redcord && <>
            <div style={{ fontSize:13, color:'#64748B', marginBottom:10 }}>{t.redcord.rationale}</div>
            {techList(t.redcord.techniques, 'red')}
          </>}
          {tab === 'pil' && t.pilates && <>
            <div style={{ fontSize:13, color:'#64748B', marginBottom:10 }}>{t.pilates.rationale}</div>
            {techList(t.pilates.techniques, 'pil')}
          </>}
          {t.precautions?.length > 0 && (
            <div className="alert alert-warning" style={{ marginTop:14 }}>
              <div>{t.precautions.map((p: string, i: number) => <div key={i}>• {p}</div>)}</div>
            </div>
          )}
        </div>}
      </div>

      {/* References Card */}
      {refs.length > 0 && (
        <div className="card">
          <div className="card-header collapsible-header" onClick={() => setRefOpen(o => !o)}>
            <i className="ti ti-books" style={{ color:'#3C3489', fontSize:18 }}></i>
            <span style={{ fontWeight:500, flex:1 }}>公開學習資源</span>
            <span className="badge badge-purple">{refs.length} 筆</span>
            <i className={`ti ti-chevron-${refOpen ? 'up' : 'down'}`} style={{ color:'#94A3B8' }}></i>
          </div>
          {refOpen && <div className="card-body" style={{ display:'grid', gap:8 }}>
            {refs.map((r: any, i: number) => (
              <div key={i} style={{ display:'flex', gap:10, background:'#F8FAFC', border:'0.5px solid #E2E8F0', borderRadius:7, padding:'9px 11px' }}>
                <i className={`ti ${r.type === 'video' ? 'ti-brand-youtube' : 'ti-file-text'}`} style={{ color:'#185FA5', fontSize:17, flexShrink:0, marginTop:1 }}></i>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{r.title}</div>
                  <div style={{ fontSize:12, color:'#64748B', marginBottom:3 }}>{r.description}{r.source && <span style={{ marginLeft:6, background:'white', padding:'1px 6px', borderRadius:4, border:'0.5px solid #E2E8F0' }}>{r.source}</span>}</div>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, wordBreak:'break-all' }}>{r.url}</a>
                </div>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  )
}
