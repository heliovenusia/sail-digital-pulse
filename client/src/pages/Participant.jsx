import { useState, useEffect, useRef } from 'react'
import { getOrCreateIdentity } from '../utils/identity.js'
import { APP_CONFIG } from '../config.js'
import DisclosureModal from '../components/DisclosureModal.jsx'
import { LogoLeft, LogoRight } from '../components/LogoBar.jsx'

const C = APP_CONFIG.colors

export default function Participant({ appState, socket }) {
  const [identity] = useState(() => getOrCreateIdentity())
  const [inputText, setInputText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedText, setSubmittedText] = useState('')
  const [showDisclosure, setShowDisclosure] = useState(false)
  const joinedRef = useRef(false)
  const prevQuestionId = useRef(null)

  // Join on mount
  useEffect(() => {
    if (!joinedRef.current && socket) {
      socket.emit('participant:join', identity)
      joinedRef.current = true
    }
  }, [socket, identity])

  // Reset state when active question changes
  useEffect(() => {
    if (appState.activeQuestionId !== prevQuestionId.current) {
      prevQuestionId.current = appState.activeQuestionId
      setInputText('')
      setSubmitted(false)
      setSubmittedText('')
    }
  }, [appState.activeQuestionId])

  const activeQuestion = appState.questions?.find(q => q.id === appState.activeQuestionId)
  const isLocked = appState.locked
  const canEdit = submitted && !isLocked

  function handleSubmit() {
    if (!inputText.trim() || isLocked || !activeQuestion) return
    socket.emit('response:submit', {
      participantId: identity.id,
      questionId: appState.activeQuestionId,
      text: inputText.trim(),
    })
    setSubmitted(true)
    setSubmittedText(inputText.trim())
  }

  function handleEdit() {
    setSubmitted(false)
    setInputText(submittedText)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${C.background} 0%, #12012a 100%)`,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingBottom: 12,
        gap: 8,
      }}>
        <LogoLeft size="sm" />
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {APP_CONFIG.name}
          </div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, letterSpacing: '0.04em' }}>
            {APP_CONFIG.subtitle}
          </div>
        </div>
        <LogoRight size="sm" />
      </div>

      {/* Identity Card */}
      <div style={{
        background: C.surface,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: '14px 18px',
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.primary}33, ${C.secondary}33)`,
          border: `2px solid ${C.primary}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}>
          {identity.emoji}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
            {identity.username}
          </div>
          <div style={{
            fontSize: 11,
            color: C.textMuted,
            fontFamily: 'monospace',
            marginTop: 2,
            background: `${C.primary}20`,
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 4,
          }}>
            ID: {identity.id}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginTop: 20 }}>
        {!activeQuestion ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: C.textMuted,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.textDim }}>
              Waiting for a question...
            </div>
            <div style={{ fontSize: 14, marginTop: 8, color: C.textDim }}>
              The facilitator will activate a question shortly.
            </div>
          </div>
        ) : (
          <div>
            {/* Question Card */}
            <div style={{
              background: `linear-gradient(135deg, ${C.primary}15, ${C.secondary}10)`,
              border: `1px solid ${C.primary}40`,
              borderRadius: 20,
              padding: '20px 22px',
              marginBottom: 20,
            }}>
              <div style={{
                fontSize: 11,
                color: C.accent,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
                marginBottom: 10,
              }}>
                Current Question
              </div>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: C.text,
                lineHeight: 1.4,
              }}>
                {activeQuestion.text}
              </div>
            </div>

            {/* Locked Banner */}
            {isLocked && (
              <div style={{
                background: `${C.warning}20`,
                border: `1px solid ${C.warning}50`,
                borderRadius: 12,
                padding: '10px 16px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                color: C.warning,
                fontWeight: 600,
              }}>
                🔒 Responses are currently locked
              </div>
            )}

            {/* Response area */}
            {submitted && !canEdit ? (
              <div style={{
                background: `${C.success}15`,
                border: `1px solid ${C.success}40`,
                borderRadius: 16,
                padding: '18px 20px',
              }}>
                <div style={{
                  fontSize: 11,
                  color: C.success,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  marginBottom: 8,
                }}>
                  ✓ Response Submitted
                </div>
                <div style={{
                  fontSize: 16,
                  color: C.text,
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}>
                  "{submittedText}"
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLocked}
                  placeholder={isLocked ? 'Submissions are locked...' : 'Type your response here...'}
                  maxLength={200}
                  rows={4}
                  style={{
                    width: '100%',
                    background: C.surface,
                    border: `1px solid ${isLocked ? C.border : C.primary}80`,
                    borderRadius: 14,
                    padding: '14px 16px',
                    color: isLocked ? C.textDim : C.text,
                    fontSize: 16,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    cursor: isLocked ? 'not-allowed' : 'text',
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 4,
                }}>
                  <span style={{ fontSize: 11, color: C.textDim }}>
                    Ctrl+Enter to submit
                  </span>
                  <span style={{ fontSize: 11, color: C.textDim }}>
                    {inputText.length}/200
                  </span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              {canEdit && (
                <button
                  onClick={handleEdit}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    color: C.text,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.2s',
                  }}
                >
                  ✏️ Edit Response
                </button>
              )}

              {!submitted && (
                <button
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || isLocked}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: (!inputText.trim() || isLocked)
                      ? `${C.primary}40`
                      : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                    border: 'none',
                    borderRadius: 12,
                    color: (!inputText.trim() || isLocked) ? C.textDim : '#fff',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: (!inputText.trim() || isLocked) ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s',
                    letterSpacing: '0.02em',
                  }}
                >
                  Submit Response →
                </button>
              )}

              {submitted && isLocked && (
                <button
                  disabled
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: `${C.success}20`,
                    border: `1px solid ${C.success}40`,
                    borderRadius: 12,
                    color: C.success,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'default',
                    fontFamily: 'inherit',
                  }}
                >
                  ✓ Submitted
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '16px 0',
        fontSize: 11,
        color: C.textDim,
      }}>
        {appState.participantCount > 0 && (
          <div style={{ marginBottom: 6 }}>
            {appState.participantCount} participant{appState.participantCount !== 1 ? 's' : ''} joined
          </div>
        )}
        <div>SAIL Digital Transformation Division, Ranchi</div>
        <button
          onClick={() => setShowDisclosure(true)}
          style={{
            marginTop: 6,
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
