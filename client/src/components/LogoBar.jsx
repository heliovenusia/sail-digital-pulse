import logo1 from '../assets/logo1.jpg'
import logo2 from '../assets/logo2.jpg'

/**
 * Renders logo1 (left) and logo2 (right) as a pair.
 * size: 'sm' (mobile) | 'md' (desktop) | 'lg' (projector)
 * Returns an array [leftLogo, rightLogo] so callers can place them
 * wherever they need inside their own flex layout.
 */

const HEIGHTS = { sm: 44, md: 52, lg: 68 }

function Logo({ src, alt, height }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        height,
        width: 'auto',
        objectFit: 'contain',
        background: 'white',
        borderRadius: 10,
        padding: '4px 6px',
        display: 'block',
        boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
        flexShrink: 0,
      }}
    />
  )
}

export function LogoLeft({ size = 'md' }) {
  return <Logo src={logo1} alt="Pravartanam" height={HEIGHTS[size] ?? HEIGHTS.md} />
}

export function LogoRight({ size = 'md' }) {
  return <Logo src={logo2} alt="SAIL" height={HEIGHTS[size] ?? HEIGHTS.md} />
}
