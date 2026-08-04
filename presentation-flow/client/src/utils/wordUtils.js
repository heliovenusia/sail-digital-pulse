const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'its', 'as', 'be', 'was', 'are',
  'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
  'those', 'i', 'we', 'you', 'he', 'she', 'they', 'my', 'our', 'your',
  'not', 'no', 'so', 'if', 'up', 'out', 'more', 'very', 'just', 'also',
  'about', 'into', 'than', 'then', 'when', 'what', 'how', 'all', 'any',
])

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .filter(t => t.length > 1 && !STOPWORDS.has(t))
}

export function normalizeResponses(responses) {
  if (!responses || responses.length === 0) return []

  const unigramCounts = new Map()
  const bigramCounts = new Map()

  for (const response of responses) {
    if (!response || typeof response !== 'string') continue
    const tokens = tokenize(response)

    // Count unigrams
    const seen = new Set()
    for (const token of tokens) {
      if (!seen.has(token)) {
        unigramCounts.set(token, (unigramCounts.get(token) || 0) + 1)
        seen.add(token)
      }
    }

    // Count bigrams (within single response)
    const seenBi = new Set()
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`
      if (!seenBi.has(bigram)) {
        bigramCounts.set(bigram, (bigramCounts.get(bigram) || 0) + 1)
        seenBi.add(bigram)
      }
    }
  }

  const combined = new Map(unigramCounts)

  // Only include bigrams that appear more than once (to reduce noise)
  for (const [bigram, count] of bigramCounts.entries()) {
    if (count >= 2) {
      combined.set(bigram, count)
    }
  }

  return [...combined.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([text, value]) => ({ text, value }))
}
