import { useEffect, useState } from 'react'
import { APP_CONFIG } from '../config.js'

const C = APP_CONFIG.colors
const STAGES = [
  ['welcome', 'Welcome'], ['join', 'Join'], ['question', 'Question'], ['collect', 'Collect'],
  ['locked', 'Locked'], ['results', 'Results'], ['discussion', 'Discuss'], ['summary', 'Summary'],
]

function Panel({ children, style = {} }) {
  return <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, ...style }}>{children}</section>
}

function Button({ children, onClick, disabled, primary, danger, style = {} }) {
  return <button disabled={disabled} onClick={onClick} style={{ border: `1px solid ${danger ? '#ef444466' : primary ? 'transparent' : C.border}`, borderRadius: 12, padding: '11px 16px', color: disabled ? C.textDim : danger ? '#f87171' : '#fff', background: disabled ? C.surface : primary ? `linear-gradient(135deg,${C.primary},${C.secondary})` : danger ? '#ef444418' : C.surface, fontWeight: 750, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', ...style }}>{children}</button>
}

export default function PresenterAdmin({ appState, socket, onExit, onPresent }) {
  const [password, setPassword] = useState(() => sessionStorage.getItem('admin_pw') || '')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')
  const [connected, setConnected] = useState(socket.connected)
  const stage = appState.presentationStage || 'welcome'
  const active = appState.questions?.find(q => q.id === appState.activeQuestionId)
  const activeIndex = appState.questions?.findIndex(q => q.id === appState.activeQuestionId) ?? -1
  const responseCount = appState.responseCounts?.[appState.activeQuestionId] || 0

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_pw')
    if (stored) login(stored)
    const yes = () => setConnected(true), no = () => setConnected(false)
    socket.on('connect', yes); socket.on('disconnect', no)
    return () => { socket.off('connect', yes); socket.off('disconnect', no) }
  }, [])

  async function login(value) {
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: value }) })
      if (!res.ok) throw new Error('Incorrect password')
      setAuthed(true); setError(''); sessionStorage.setItem('admin_pw', value)
    } catch (e) { setError(e.message || 'Connection error') }
  }
  const emit = (event, extra = {}) => socket.emit(event, { password, ...extra })
  const addQuestion = () => { if (question.trim()) { emit('admin:create:question', { text: question.trim() }); setQuestion('') } }
  const advance = direction => emit('admin:presentation:advance', { direction })

  if (!authed) return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.background, color: C.text, fontFamily: 'Inter,system-ui' }}><Panel style={{ width: 360 }}><h1 style={{ marginTop: 0 }}>Presenter View</h1><p style={{ color: C.textMuted }}>Sign in to run the live presentation.</p><input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login(password)} placeholder="Admin password" style={{ width: '100%', boxSizing: 'border-box', padding: 13, borderRadius: 10, border: `1px solid ${C.border}`, background: C.background, color: C.text, marginBottom: 10 }} />{error && <p style={{ color: '#f87171' }}>{error}</p>}<Button primary onClick={() => login(password)} style={{ width: '100%' }}>Sign in</Button></Panel></main>

  return <main style={{ minHeight: '100vh', padding: 22, background: `radial-gradient(circle at 15% 0%,${C.primary}22,transparent 35%),${C.background}`, color: C.text, fontFamily: 'Inter,system-ui' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}><div><h1 style={{ margin: 0, fontSize: 26 }}>{APP_CONFIG.name} · Presenter View</h1><div style={{ color: C.textMuted, marginTop: 5 }}>{connected ? '● Connected' : '● Reconnecting'} · Single application URL</div></div><div style={{ display: 'flex', gap: 9 }}><Button onClick={onExit}>Participant view</Button><Button primary onClick={onPresent}>Present full screen ↗</Button></div></header>

    <Panel style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto' }}>{STAGES.map(([id, label]) => <button key={id} onClick={() => emit('admin:presentation:stage', { stage: id })} disabled={!appState.activeQuestionId && ['question','collect','locked','results','discussion'].includes(id)} style={{ flex: 1, minWidth: 86, padding: '10px 7px', borderRadius: 10, border: `1px solid ${stage === id ? C.accent : C.border}`, background: stage === id ? `${C.accent}22` : 'transparent', color: stage === id ? C.accent : C.textMuted, fontWeight: 700, cursor: 'pointer' }}>{label}</button>)}</div>
    </Panel>

    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(320px,.75fr)', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Panel style={{ minHeight: 235, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: `linear-gradient(145deg,${C.primary}18,${C.surface})` }}>
          <div><div style={{ color: C.accent, textTransform: 'uppercase', letterSpacing: '.14em', fontSize: 12, fontWeight: 800 }}>On screen now · {STAGES.find(s => s[0] === stage)?.[1]}</div><h2 style={{ fontSize: 30, lineHeight: 1.25 }}>{active?.text || (stage === 'welcome' ? 'Welcome presentation' : stage === 'join' ? 'Audience join screen' : stage === 'summary' ? 'Session summary' : 'Select or add a question')}</h2><div style={{ color: C.textMuted }}>{appState.participantCount || 0} joined · {responseCount} responses{active ? ` · Question ${activeIndex + 1} of ${appState.questions.length}` : ''}</div></div>
          <div style={{ display: 'flex', gap: 12 }}><Button onClick={() => advance(-1)}>← Previous</Button><Button primary onClick={() => advance(1)} disabled={(stage === 'join' && !appState.questions?.length) || stage === 'summary'} style={{ flex: 1, fontSize: 17 }}>Next presentation step →</Button></div>
        </Panel>

        <Panel><h3 style={{ marginTop: 0 }}>Questions</h3><div style={{ display: 'flex', gap: 8 }}><textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Add a polling question" rows={2} style={{ flex: 1, resize: 'vertical', padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: C.background, color: C.text }} /><Button primary onClick={addQuestion} disabled={!question.trim()}>Add</Button></div><div style={{ display: 'grid', gap: 8, marginTop: 14, maxHeight: 260, overflowY: 'auto' }}>{appState.questions?.map((q, i) => <button key={q.id} onClick={() => emit('admin:activate', { questionId: q.id })} style={{ textAlign: 'left', padding: 12, borderRadius: 10, border: `1px solid ${q.id === appState.activeQuestionId ? C.primary : C.border}`, background: q.id === appState.activeQuestionId ? `${C.primary}1f` : C.background, color: C.text, cursor: 'pointer' }}><b>Q{i + 1}</b> · {q.text}<span style={{ float: 'right', color: C.textMuted }}>{appState.responseCounts?.[q.id] || 0}</span></button>)}</div></Panel>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Panel><h3 style={{ marginTop: 0 }}>What Next does</h3><p style={{ color: C.textMuted, lineHeight: 1.55, marginBottom: 0 }}>{stage === 'welcome' ? 'Shows the audience join screen.' : stage === 'join' ? 'Reveals the first question.' : stage === 'question' ? 'Opens participant responses.' : stage === 'collect' ? 'Locks responses and creates anticipation.' : stage === 'locked' ? 'Reveals the live results.' : stage === 'results' ? 'Moves to the facilitated discussion.' : stage === 'discussion' ? (activeIndex < appState.questions.length - 1 ? 'Moves to the next question.' : 'Builds the final session summary.') : 'The presentation is complete.'}</p></Panel>
        <Panel><h3 style={{ marginTop: 0 }}>Recovery controls</h3><div style={{ display: 'grid', gap: 9 }}><Button onClick={() => emit('admin:lock', { locked: !appState.locked })}>{appState.locked ? 'Unlock submissions' : 'Lock submissions'}</Button><Button onClick={() => emit('admin:results', { visible: !appState.resultsVisible })}>{appState.resultsVisible ? 'Hide results' : 'Show results'}</Button><Button danger disabled={!active} onClick={() => window.confirm('Clear responses for this question?') && emit('admin:reset:question', { questionId: active.id })}>Clear current responses</Button><Button danger onClick={() => window.confirm('Reset the entire session?') && window.confirm('This clears all questions and responses. Continue?') && emit('admin:reset:session')}>Reset entire session</Button></div></Panel>
      </div>
    </div>
  </main>
}
