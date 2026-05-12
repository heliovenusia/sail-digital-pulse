import { useEffect } from 'react'
import { APP_CONFIG } from '../config.js'

const C = APP_CONFIG.colors

export default function DisclosureModal({ onClose }) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          animation: 'fdFadeIn 0.2s ease',
        }}
      >
        <style>{`
          @keyframes fdFadeIn  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fdSlideUp { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>

        {/* Modal box — stop click from bubbling to backdrop */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(145deg, #13102a, #0d1a22)',
            border: `1px solid ${C.primary}50`,
            borderRadius: 20,
            padding: '28px 30px',
            width: '100%',
            maxWidth: 480,
            boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${C.primary}20`,
            animation: 'fdSlideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.textMuted,
              width: 30,
              height: 30,
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            ×
          </button>

          {/* Header */}
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            color: C.text,
            letterSpacing: '-0.02em',
            marginBottom: 20,
          }}>
            Full Disclosure
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, ${C.primary}50, transparent)`, marginBottom: 20 }} />

          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div style={{
              background: 'rgba(99,102,241,0.08)',
              border: `1px solid ${C.primary}30`,
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>
                Built using selectively adapted open-source real-time interaction
                components, including but not limited to{' '}
                <span style={{ color: C.accent, fontWeight: 600 }}>
                  GitHub/Live-Poll
                </span>.
              </div>
            </div>

            <div style={{
              background: 'rgba(16,185,129,0.07)',
              border: `1px solid ${C.success}25`,
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>
                Customized and operationally adapted internally for SAIL
                workshop engagement use cases.
              </div>
            </div>

            <div style={{
              background: 'rgba(6,182,212,0.07)',
              border: `1px solid ${C.accent}25`,
              borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>
                Enterprise AI-assisted tooling was utilized during development
                and enhancement activities.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 22,
            paddingTop: 14,
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 11, color: C.textDim }}>
              SAIL Digital Transformation Division, Ranchi
            </span>
            <button
              onClick={onClose}
              style={{
                padding: '7px 18px',
                background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
