import { useMemo } from 'react'
import { normalizeResponses } from '../utils/wordUtils.js'
import WordCloudView from '../components/WordCloudView.jsx'
import QRCodeDisplay from '../components/QRCodeDisplay.jsx'
import ConfettiEffect from '../components/ConfettiEffect.jsx'
import { LogoLeft, LogoRight } from '../components/LogoBar.jsx'
import { APP_CONFIG } from '../config.js'

const C = APP_CONFIG.colors

function Frame({ children, kicker, title, footer }) {
  return <div style={{ position: 'relative', zIndex: 1, height: '100%', boxSizing: 'border-box', padding: '42px 58px', display: 'flex', flexDirection: 'column' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><LogoLeft size="xl"/><div><div style={{ fontWeight: 900, fontSize: 24 }}>{APP_CONFIG.name}</div><div style={{ color: C.textMuted, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>{APP_CONFIG.subtitle}</div></div></div><LogoRight size="xl"/></header>
    <main key={`${kicker}-${title}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'slideIn .55s ease both' }}>{kicker && <div style={{ color: C.accent, textTransform: 'uppercase', letterSpacing: '.18em', fontWeight: 800, fontSize: 15, marginBottom: 18 }}>{kicker}</div>}{title && <h1 style={{ fontSize: 'clamp(42px,5vw,78px)', lineHeight: 1.08, maxWidth: 1100, margin: 0 }}>{title}</h1>}{children}</main>
    <footer style={{ color: C.textDim, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}><span>SAIL Digital Transformation Division, Ranchi</span><span>{footer || '● Live'}</span></footer>
  </div>
}

export default function PresentationDisplay({ appState }) {
  const stage = appState.presentationStage || 'welcome'
  const active = appState.questions?.find(q => q.id === appState.activeQuestionId)
  const words = useMemo(() => normalizeResponses(appState.activeResponses || []), [appState.activeResponses])
  const responses = appState.responseCounts?.[appState.activeQuestionId] || 0
  const joined = appState.participantCount || 0
  const engagement = joined ? Math.round(responses / joined * 100) : 0
  const index = appState.questions?.findIndex(q => q.id === appState.activeQuestionId) ?? -1
  const common = { position: 'fixed', inset: 0, overflow: 'hidden', color: C.text, fontFamily: 'Inter,system-ui,sans-serif', background: `radial-gradient(circle at 15% 20%,${C.primary}30,transparent 32%),radial-gradient(circle at 88% 78%,${C.accent}20,transparent 30%),linear-gradient(135deg,${C.background},#080314 55%,#00141b)` }

  const summary = (appState.questions || []).map((q, i) => ({ q, i, count: appState.responseCounts?.[q.id] || 0 }))

  return <div style={common}>
    <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}@keyframes pulse{50%{opacity:.45}}`}</style>
    {stage === 'welcome' && <Frame kicker="Live interactive session" title="SAIL Digital Pulse"><div style={{ marginTop: 32 }}><p style={{ fontSize: 27, color: C.text, fontWeight: 700, margin: 0 }}>SAIL Digital Transformation Division, Ranchi</p><p style={{ fontSize: 21, color: C.textMuted, marginTop: 10 }}>Steel Authority of India Limited</p></div></Frame>}
    {stage === 'join' && <Frame kicker="Join the conversation" title="Scan. Join. Have your say." footer={`${joined} participant${joined === 1 ? '' : 's'} joined`}><div style={{ display: 'flex', alignItems: 'center', gap: 50, marginTop: 36 }}><div style={{ background: '#fff', padding: 16, borderRadius: 20 }}><QRCodeDisplay size={250}/></div><div><div style={{ fontSize: 64, fontWeight: 900, color: C.accent }}>{joined}</div><div style={{ color: C.textMuted, fontSize: 22 }}>participants are ready</div></div></div></Frame>}
    {stage === 'question' && <Frame kicker={`Question ${Math.max(1,index + 1)} of ${appState.questions?.length || 1}`} title={active?.text || 'The next question is coming…'}><p style={{ fontSize: 24, color: C.textMuted, marginTop: 30 }}>Take a moment to think before responses open.</p></Frame>}
    {stage === 'collect' && <Frame kicker="Responses are open" title={active?.text} footer={`${responses} of ${joined} responded`}><div style={{ marginTop: 42, maxWidth: 950 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 23, marginBottom: 12 }}><span>Share your view on your phone</span><b style={{ color: C.accent }}>{engagement}% engaged</b></div><div style={{ height: 15, background: C.border, borderRadius: 99, overflow: 'hidden' }}><div style={{ width: `${Math.min(100, engagement)}%`, height: '100%', transition: 'width .7s ease', background: `linear-gradient(90deg,${C.primary},${C.accent})` }}/></div></div></Frame>}
    {stage === 'locked' && <Frame kicker="Responses are in" title="Let’s see what the room thinks." footer={`${responses} responses collected`}><div style={{ fontSize: 90, marginTop: 25 }}>✦</div><p style={{ color: C.textMuted, fontSize: 24, animation: 'pulse 1.6s infinite' }}>Preparing the reveal…</p></Frame>}
    {stage === 'results' && <><ConfettiEffect trigger={engagement >= 50 && responses > 0}/><Frame kicker="The room has spoken" title={active?.text} footer={`${engagement}% engagement`}><div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 35, height: '48vh', marginTop: 28 }}><div style={{ border: `1px solid ${C.border}`, borderRadius: 24, background: C.surface, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>{words.length ? <WordCloudView words={words}/> : <span style={{ color: C.textMuted, fontSize: 22 }}>No responses yet</span>}</div><div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div style={{ color: C.textMuted, textTransform: 'uppercase', letterSpacing: '.15em' }}>Dominant theme</div><div style={{ fontSize: 42, fontWeight: 900, color: C.accent, margin: '12px 0 35px', overflowWrap: 'anywhere' }}>{words[0]?.text || '—'}</div><div style={{ fontSize: 54, fontWeight: 900 }}>{responses}</div><div style={{ color: C.textMuted, fontSize: 18 }}>responses</div></div></div></Frame></>}
    {stage === 'discussion' && <Frame kicker="Make meaning together" title={words[0]?.text ? `Why did “${words[0].text}” stand out?` : 'What surprised you in these responses?'} footer="Facilitated discussion"><div style={{ display: 'flex', gap: 25, marginTop: 42, flexWrap: 'wrap' }}>{words.slice(0, 5).map((w,i) => <div key={w.text} style={{ fontSize: 22 + Math.max(0, 10 - i * 2), color: APP_CONFIG.wordCloud.colors[i], borderBottom: `3px solid ${APP_CONFIG.wordCloud.colors[i]}55`, paddingBottom: 8 }}>{w.text} <small style={{ color: C.textMuted }}>×{w.value}</small></div>)}</div><p style={{ fontSize: 24, color: C.textMuted, marginTop: 50 }}>What does this mean for the way we work?</p></Frame>}
    {stage === 'summary' && <Frame kicker="Session summary" title="What we heard today"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 18, marginTop: 32, maxHeight: '50vh', overflow: 'hidden' }}>{summary.slice(0, 6).map(({q,i,count}) => <div key={q.id} style={{ borderLeft: `4px solid ${APP_CONFIG.wordCloud.colors[i % APP_CONFIG.wordCloud.colors.length]}`, padding: '10px 18px', background: C.surface }}><div style={{ color: C.textMuted, fontSize: 13 }}>QUESTION {i + 1} · {count} RESPONSES</div><div style={{ fontSize: 21, fontWeight: 750, marginTop: 7 }}>{q.text}</div></div>)}</div><p style={{ fontSize: 24, color: C.accent, marginTop: 35 }}>Thank you for making every voice count.</p></Frame>}
  </div>
}
