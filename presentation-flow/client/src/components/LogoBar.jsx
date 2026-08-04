import logo1 from '../assets/logo1.jpg'
import logo2 from '../assets/logo2.jpg'

/**
 * Renders logo1 (left) and logo2 (right) as a pair.
 * size: 'sm' (mobile) | 'md' (desktop) | 'lg' (projector)
 * Returns an array [leftLogo, rightLogo] so callers can place them
 * wherever they need inside their own flex layout.
 */

// Heights per context. xl is for the projector/display screen.
const HEIGHTS = { sm: 44, md: 52, lg: 72, xl: 96 }

function Logo({ src, alt, height }) {
  return (
    <img
      src={src}
      alt={alt}
      // width:auto + explicit height = browser preserves natural aspect ratio.
      // objectFit is intentionally omitted — it can distort <img> when width is auto.
      style={{
        height,
        width: 'auto',
        display: 'block',
        background: 'white',
        borderRadius: 10,
        padding: '5px 8px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
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
