import { useState, useEffect } from 'react'
import QRCodeDisplay from '../components/QRCodeDisplay.jsx'
import DisclosureModal from '../components/DisclosureModal.jsx'
import { LogoLeft, LogoRight } from '../components/LogoBar.jsx'
import { APP_CONFIG } from '../config.js'

const C = APP_CONFIG.colors

function Btn({ onClick, disabled, children, color, outline, danger, small }) {
  const bg = danger
    ? (outline ? 'transparent' : '#ef444420')
    : (outline ? 'transparent' : (color || C.primary))
  const borderColor = danger ? '#ef444460' : (outline ? C.border : 'transparent')
  const textColor = danger ? '#ef4444' : (outline ? C.text : '#fff')

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? '7px 14px' : '10px 18px',
        background: disabled ? `${C.surface}` : bg,
        border: `1px solid ${disabled ? C.border : borderColor}`,
        borderRadius: 10,
        color: disabled ? C.textDim : textColor,
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.surface,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11,
      color: C.accent,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      fontWeight: 700,
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

export default function Admin({ appState, socket }) {
  const [password, setPassword] = useState(() => sessionStorage.getItem('admin_pw') || '')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [newQuestionText, setNewQuestionText] = useState('')
  const [connected, setConnected] = useState(socket.connected)
  const [showDisclosure, setShowDisclosure] = useState(false)

  useEffect(() => {
    // Auto-try stored password
    const stored = sessionStorage.getItem('admin_pw')
    if (stored) tryAuth(stored)

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [])

  async function tryAuth(pw) {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      const data = await res.json()
      if (data.ok) {
        setAuthed(true)
        setAuthError('')
        sessionStorage.setItem('admin_pw', pw)
      } else {
        setAuthError('Incorrect password')
        sessionStorage.removeItem('admin_pw')
      }
    } catch {
      setAuthError('Connection error. Is the server running?')
    }
  }

  function emit(event, extra = {}) {
    socket.emit(event, { password, ...extra })
  }

  function handleActivate(questionId) {
    emit('admin:activate', { questionId })
  }

  function handleCreateQuestion() {
    if (!newQuestionText.trim()) return
    emit('admin:create:question', { text: newQuestionText.trim() })
    setNewQuestionText('')
  }

  function handleResetQuestion() {
    if (!appState.activeQuestionId) return
    if (!window.confirm('Reset all responses for the current question?')) return
    emit('admin:reset:question', { questionId: appState.activeQuestionId })
  }

  function handleResetSession() {
    if (!window.confirm('Reset ENTIRE session? This will clear all questions, participants, and responses.')) return
    if (!window.confirm('Are you sure? This cannot be undone.')) return
    emit('admin:reset:session')
  }

  const activeQuestion = appState.questions?.find(q => q.id === appState.activeQuestionId)
  const activeIdx = appState.questions?.findIndex(q => q.id === appState.activeQuestionId)
  const responseCount = appState.activeQuestionId
    ? (appState.responseCounts?.[appState.activeQuestionId] || 0)
    : 0

  // ── Login Screen ────────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${C.background} 0%, #12012a 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}>
              {APP_CONFIG.name}
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
              Admin Console
            </div>
          </div>

          <Card>
            <SectionTitle>Admin Password</SectionTitle>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryAuth(password)}
              placeholder="Enter admin password..."
              autoFocus
              style={{
                width: '100%',
                background: C.background,
                border: `1px solid ${authError ? '#ef4444' : C.border}`,
                borderRadius: 10,
                padding: '12px 14px',
                color: C.text,
                fontSize: 15,
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                marginBottom: 12,
              }}
            />
            {authError && (
              <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>
                {authError}
              </div>
            )}
            <button
              onClick={() => tryAuth(password)}
              style={{
                width: '100%',
                padding: '12px',
                background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Sign In →
            </button>
          </Card>
        </div>
      </div>
    )
  }

  // ── Admin Dashboard ─────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${C.background} 0%, #12012a 100%)`,
      padding: '16px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 12,
      }}>
        {/* Left: logo1 + branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LogoLeft size="md" />
          <div>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}>
              {APP_CONFIG.name}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Admin Console</div>
          </div>
        </div>

        {/* Right: logo2 + controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LogoRight size="md" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: connected ? C.success : '#ef4444',
            }} />
            <span style={{ fontSize: 12, color: C.textMuted }}>
              {connected ? 'Live' : 'Disconnected'}
            </span>
            <Btn small outline onClick={() => {
              setAuthed(false)
              sessionStorage.removeItem('admin_pw')
            }}>
              Sign out
            </Btn>
          </div>
        </div>
      </div>

      {!connected && (
        <div style={{
          background: '#ef444420',
          border: '1px solid #ef444450',
          borderRadius: 10,
          padding: '10px 14px',
          color: '#ef4444',
          fontSize: 13,
          marginBottom: 16,
        }}>
          ⚠ Reconnecting to server...
        </div>
      )}

      {/* Live Stats Bar */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
      }}>
        {[
          { label: 'Participants', value: appState.participantCount || 0, color: C.accent, icon: '👥' },
          { label: 'Responses', value: responseCount, color: C.secondary, icon: '💬' },
          { label: 'Questions', value: appState.questions?.length || 0, color: C.primary, icon: '❓' },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1,
            background: C.surface,
            border: `1px solid ${stat.color}30`,
            borderRadius: 12,
            padding: '12px 14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18 }}>{stat.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, lineHeight: 1.2 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Left — Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Create Question */}
          <Card>
            <SectionTitle>Add Question</SectionTitle>
            <textarea
              value={newQuestionText}
              onChange={e => setNewQuestionText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleCreateQuestion()}
              placeholder="Type a question..."
              rows={3}
              style={{
                width: '100%',
                background: C.background,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '10px 12px',
                color: C.text,
                fontSize: 14,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                marginBottom: 10,
              }}
            />
            <Btn onClick={handleCreateQuestion} disabled={!newQuestionText.trim()}>
              + Add Question
            </Btn>
          </Card>

          {/* Question List */}
          <Card style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <SectionTitle style={{ marginBottom: 0 }}>Questions</SectionTitle>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn small outline onClick={() => emit('admin:prev')} disabled={!appState.questions?.length}>
                  ← Prev
                </Btn>
                <Btn small outline onClick={() => emit('admin:next')} disabled={!appState.questions?.length}>
                  Next →
                </Btn>
              </div>
            </div>

            {appState.questions?.length === 0 ? (
              <div style={{ color: C.textDim, fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                No questions yet. Add one above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                {appState.questions.map((q, idx) => {
                  const isActive = q.id === appState.activeQuestionId
                  const qResponseCount = appState.responseCounts?.[q.id] || 0
                  return (
                    <div
                      key={q.id}
                      style={{
                        background: isActive ? `${C.primary}20` : C.background,
                        border: `1px solid ${isActive ? C.primary + '60' : C.border}`,
                        borderRadius: 10,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}>
                        <div>
                          <div style={{ fontSize: 10, color: isActive ? C.primary : C.textDim, fontWeight: 600, marginBottom: 3 }}>
                            Q{idx + 1} {isActive && '● ACTIVE'}
                          </div>
                          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>
                            {q.text}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                            {qResponseCount} response{qResponseCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                        {!isActive && (
                          <Btn small onClick={() => handleActivate(q.id)}>
                            Activate
                          </Btn>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right — Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Active Question Info */}
          <Card style={{ background: activeQuestion ? `${C.primary}10` : C.surface }}>
            <SectionTitle>Active Question</SectionTitle>
            {activeQuestion ? (
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>
                {activeQuestion.text}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: C.textDim, fontStyle: 'italic' }}>
                No active question. Select one from the list.
              </div>
            )}
          </Card>

          {/* Submission Controls */}
          <Card>
            <SectionTitle>Submission Control</SectionTitle>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => emit('admin:lock', { locked: !appState.locked })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: appState.locked ? `${C.warning}25` : `${C.success}20`,
                  border: `1px solid ${appState.locked ? C.warning : C.success}50`,
                  borderRadius: 10,
                  color: appState.locked ? C.warning : C.success,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                {appState.locked ? '🔒 Locked' : '🔓 Unlocked'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
              {appState.locked ? 'Participants cannot submit.' : 'Click to lock submissions.'}
            </div>
          </Card>

          {/* Display Controls */}
          <Card>
            <SectionTitle>Display Control</SectionTitle>
            <button
              onClick={() => emit('admin:results', { visible: !appState.resultsVisible })}
              style={{
                width: '100%',
                padding: '12px',
                background: appState.resultsVisible ? `${C.accent}20` : `${C.textDim}20`,
                border: `1px solid ${appState.resultsVisible ? C.accent : C.border}50`,
                borderRadius: 10,
                color: appState.resultsVisible ? C.accent : C.textMuted,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {appState.resultsVisible ? '👁 Results Visible' : '🚫 Results Hidden'}
            </button>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
              Controls what the display screen shows.
            </div>
          </Card>

          {/* Reset Controls */}
          <Card>
            <SectionTitle>Reset</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Btn
                danger
                outline
                onClick={handleResetQuestion}
                disabled={!appState.activeQuestionId}
              >
                🗑 Reset Current Question Responses
              </Btn>
              <Btn danger onClick={handleResetSession}>
                ⚠ Reset Entire Session
              </Btn>
            </div>
          </Card>

          {/* QR Code */}
          <Card style={{ textAlign: 'center' }}>
            <SectionTitle>Participant Join QR</SectionTitle>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <QRCodeDisplay size={120} />
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>
              Scan to open participant screen
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '14px 0',
        fontSize: 11,
        color: C.textDim,
        borderTop: `1px solid ${C.border}`,
        marginTop: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: '0.01em' }}>
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
          }}
        >
          Full Disclosure
        </button>
      </div>
      {showDisclosure && <DisclosureModal onClose={() => setShowDisclosure(false)} />}
    </div>
  )
}
