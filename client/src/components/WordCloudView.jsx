import { useMemo } from 'react'
import ReactWordcloud from 'react-wordcloud'
import { APP_CONFIG } from '../config.js'

const OPTIONS = {
  rotations: 2,
  rotationAngles: [-60, 0],
  fontSizes: [APP_CONFIG.wordCloud.minFontSize, APP_CONFIG.wordCloud.maxFontSize],
  colors: APP_CONFIG.wordCloud.colors,
  enableTooltip: false,
  deterministic: false,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: '700',
  padding: 4,
  spiral: 'archimedean',
  transitionDuration: 500,
}

export default function WordCloudView({ words }) {
  const safeWords = useMemo(() => {
    if (!words || words.length === 0) return []
    // Ensure valid shape and cap at 50 items
    return words
      .filter(w => w && typeof w.text === 'string' && typeof w.value === 'number')
      .slice(0, 50)
  }, [words])

  if (safeWords.length === 0) return null

  return (
    <div style={{ width: '100%', height: '380px' }}>
      <ReactWordcloud words={safeWords} options={OPTIONS} />
    </div>
  )
}
