import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { APP_CONFIG } from '../config.js'

export default function ConfettiEffect({ trigger }) {
  const fired = useRef(false)

  useEffect(() => {
    if (trigger && !fired.current) {
      fired.current = true

      // First burst
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { x: 0.3, y: 0.6 },
        colors: APP_CONFIG.wordCloud.colors,
        zIndex: 9999,
      })

      // Second burst slightly delayed
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { x: 0.7, y: 0.6 },
          colors: APP_CONFIG.wordCloud.colors,
          zIndex: 9999,
        })
      }, 200)

      // Third burst from top center
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { x: 0.5, y: 0.2 },
          colors: APP_CONFIG.wordCloud.colors,
          zIndex: 9999,
        })
      }, 400)
    }

    if (!trigger) {
      fired.current = false
    }
  }, [trigger])

  return null
}
