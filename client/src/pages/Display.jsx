import { useMemo, useRef, useState, useEffect } from 'react'
import { normalizeResponses } from '../utils/wordUtils.js'
import WordCloudView from '../components/WordCloudView.jsx'
import QRCodeDisplay from '../components/QRCodeDisplay.jsx'
import StatCard from '../components/StatCard.jsx'
import ConfettiEffect from '../components/ConfettiEffect.jsx'
import DisclosureModal from '../components/DisclosureModal.jsx'
import { LogoLeft, LogoRight } from '../components/LogoBar.jsx'
import { APP_CONFIG } from '../config.js'

const C = APP_CONFIG.colors

// Animated background particles
function Background() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <style>{`
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,-40px) scale(1.1); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,60px) scale(0.9); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px,50px); } }
        @keyframes fadeInQ { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes barFill { from { width: 0%; } to { width: var(--bar-width); } }
        @keyframes counterUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${C.primary}18, transparent 70%)`, animation: 'float1 12s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${C.secondary}14, transparent 70%)`, animation: 'float2 15s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '40%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}10, transparent 70%)`, animation: 'float3 10s ease-in-out infinite' }} />
    </div>
  )
}

function LeaderboardBar({ rank, text, count, maxCount, color }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
  const colors = APP_CONFIG.wordCloud.colors
  const barColor = colors[rank % colors.length]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: `${barColor}30`,
        border: `1px solid ${barColor}60`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 800,
        color: barColor,
        flexShrink: 0,
      }}>
        {rank + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {text}
          </span>
          <span style={{ fontSize: 12, color: barColor, fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>
            {count}×
          </span>
        </div>
        <div style={{ height: 6, background: `${C.border}`, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${barColor}, ${barColor}90)`,
            borderRadius: 3,
            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>
    </div>
  )
}

export default function Display({ appState }) {
  const [debouncedResponses, setDebouncedResponses] = useState([])
  const debounceRef = useRef(null)
  const prevEngPct = useRef(0)
  const [showDisclosure, setShowDisclosure] = useState(false)

  // Debounce responses for word cloud to avoid thrash
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedResponses(appState.activeResponses || [])
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [appState.activeResponses])

  const wordData = useMemo(() => {
    if (!appState.resultsVisible || !debouncedResponses.length) return []
    return normalizeResponses(debouncedResponses)
  }, [debouncedResponses, appState.resultsVisible])

  const topThemes = wordData.slice(0, 5)
  const maxCount = topThemes[0]?.value || 1

  const totalParticipants = appState.participantCount || 0
  const totalResponses = appState.activeQuestionId
    ? (appState.responseCounts?.[appState.activeQuestionId] || 0)
    : 0
  const engagementPct = totalParticipants > 0
    ? Math.round((totalResponses / totalParticipants) * 100)
    : 0
  const dominantTheme = wordData[0]?.text || '—'

  const confettiTrigger = engagementPct >= Math.round(APP_CONFIG.responseThreshold * 100) && totalResponses > 0

  const activeQuestion = appState.questions?.find(q => q.id === appState.activeQuestionId)

  const hasResults = appState.resultsVisible && wordData.length > 0

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: `linear-gradient(135deg, ${C.background} 0%, #0d0120 50%, #00121a 100%)`,
      color: C.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Background />
      <ConfettiEffect trigger={confettiTrigger} />

      {/* Content Layer */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 28px' }}>

        {/* Top Row: Branding + QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
          {/* Left: logo1 + branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <LogoLeft size="lg" />
            <div>
              <div style={{
                fontSize: 26,
                fontWeight: 900,
                background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}>
                {APP_CONFIG.name}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {APP_CONFIG.subtitle}
              </div>
            </div>
          </div>

          {/* Right: logo2 + QR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <LogoRight size="lg" />
            <div style={{ textAlign: 'center' }}>
              <QRCodeDisplay size={80} />
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Join here
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <StatCard label="Joined" value={totalParticipants} icon="👥" accent={C.accent} />
          <StatCard label="Responses" value={totalResponses} icon="💬" accent={C.secondary} />
          <StatCard label="Top Theme" value={dominantTheme} icon="🏆" accent={C.warning} />
          <StatCard label="Engaged" value={`${engagementPct}%`} icon="🔥" accent={C.success} />
        </div>

        {/* Active Question */}
        <div style={{
          textAlign: 'center',
          padding: '14px 20px',
          background: C.surface,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          marginBottom: 16,
        }}>
          {activeQuestion ? (
            <div
              key={appState.activeQuestionId}
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: C.text,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                animation: 'fadeInQ 0.5s ease',
              }}
            >
              {activeQuestion.text}
            </div>
          ) : (
            <div style={{ fontSize: 20, color: C.textMuted, fontStyle: 'italic', animation: 'pulse 2s ease-in-out infinite' }}>
              Waiting for the facilitator to start a question...
            </div>
          )}
        </div>

        {/* Main: Word Cloud + Leaderboard */}
        <div style={{ flex: 1, display: 'flex', gap: 20, minHeight: 0 }}>

          {/* Word Cloud */}
          <div style={{
            flex: 1,
            background: C.surface,
            backdropFilter: 'blur(12px)',
            borderRadius: 20,
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: 16,
          }}>
            {hasResults ? (
              <WordCloudView words={wordData} />
            ) : (
              <div style={{ textAlign: 'center', color: C.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {!appState.activeQuestionId ? '❓' : !appState.resultsVisible ? '👁' : '⏳'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: C.textDim }}>
                  {!appState.activeQuestionId
                    ? 'No active question'
                    : !appState.resultsVisible
                      ? 'Results hidden'
                      : 'Waiting for responses...'}
                </div>
                {appState.resultsVisible && appState.activeQuestionId && (
                  <div style={{ fontSize: 14, marginTop: 8, color: C.textDim }}>
                    Responses will appear here as participants submit
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div style={{
            width: 280,
            background: C.surface,
            backdropFilter: 'blur(12px)',
            borderRadius: 20,
            border: `1px solid ${C.border}`,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}>
            <div style={{
              fontSize: 12,
              color: C.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 700,
              marginBottom: 14,
            }}>
              🏅 Top Themes
            </div>

            {topThemes.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: C.textDim, fontSize: 13, fontStyle: 'italic' }}>
                  Themes will appear here...
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {topThemes.map((item, idx) => (
                  <LeaderboardBar
                    key={item.text}
                    rank={idx}
                    text={item.text}
                    count={item.value}
                    maxCount={maxCount}
                  />
                ))}
              </div>
            )}

            {/* Engagement meter */}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: C.textMuted,
                marginBottom: 6,
              }}>
                <span>Engagement</span>
                <span style={{ color: engagementPct >= 50 ? C.success : C.textMuted, fontWeight: 700 }}>
                  {engagementPct}%
                </span>
              </div>
              <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${engagementPct}%`,
                  background: engagementPct >= 50
                    ? `linear-gradient(90deg, ${C.success}, ${C.accent})`
                    : `linear-gradient(90deg, ${C.primary}, ${C.secondary})`,
                  borderRadius: 4,
                  transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4, textAlign: 'right' }}>
                {totalResponses} of {totalParticipants} responded
              </div>
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
          paddingTop: 10,
          fontSize: 11,
          color: C.textDim,
        }}>
          {appState.locked && (
            <span style={{ color: C.warning }}>🔒 Submissions locked</span>
          )}
          {!appState.resultsVisible && (
            <span>👁 Results hidden from display</span>
          )}
          <span style={{ animation: 'pulse 3s ease-in-out infinite' }}>
            ● Live
          </span>
          <span style={{ marginLeft: 12, opacity: 0.5 }}>
            SAIL Digital Transformation Division, Ranchi
          </span>
          <button
            onClick={() => setShowDisclosure(true)}
            style={{
              background: 'none',
              border: 'none',
              color: C.textDim,
              fontSize: 11,
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              fontFamily: 'inherit',
              padding: 0,
              opacity: 0.6,
            }}
          >
            Full Disclosure
          </button>
        </div>
      </div>
      {showDisclosure && <DisclosureModal onClose={() => setShowDisclosure(false)} />}
    </div>
  )
}
