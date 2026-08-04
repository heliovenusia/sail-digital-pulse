import { APP_CONFIG } from '../config.js'

export default function StatCard({ label, value, icon, accent, large }) {
  const color = accent || APP_CONFIG.colors.primary
  const fontSize = large ? 48 : 36

  return (
    <div style={{
      background: APP_CONFIG.colors.surface,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${color}40`,
      borderRadius: 16,
      padding: large ? '24px 28px' : '18px 22px',
      minWidth: large ? 160 : 130,
      textAlign: 'center',
      flex: 1,
      transition: 'transform 0.2s ease, border-color 0.3s ease',
    }}>
      {icon && (
        <div style={{ fontSize: large ? 32 : 24, marginBottom: 8, lineHeight: 1 }}>
          {icon}
        </div>
      )}
      <div style={{
        fontSize,
        fontWeight: 800,
        color,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        letterSpacing: '-0.02em',
        transition: 'color 0.3s ease',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: large ? 13 : 11,
        color: APP_CONFIG.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginTop: 8,
        fontWeight: 600,
      }}>
        {label}
      </div>
    </div>
  )
}
