import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeDisplay({ size = 128 }) {
  const url = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/`
    : '/'

  return (
    <div style={{
      background: 'white',
      padding: 10,
      borderRadius: 12,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      <QRCodeSVG
        value={url}
        size={size}
        bgColor="#ffffff"
        fgColor="#0a0a1a"
        level="M"
      />
    </div>
  )
}
