const ADJECTIVES = [
  'Quantum', 'Solar', 'Cosmic', 'Neon', 'Arctic', 'Amber', 'Velvet', 'Prism',
  'Jade', 'Silver', 'Iron', 'Silent', 'Data', 'Swift', 'Blazing', 'Crystal',
  'Shadow', 'Storm', 'Golden', 'Lunar', 'Astral', 'Digital', 'Onyx', 'Cobalt',
  'Ember', 'Frost', 'Hyper', 'Apex', 'Nova', 'Titan',
]

const ANIMALS = [
  'Tiger', 'Fox', 'Hawk', 'Wolf', 'Otter', 'Lynx', 'Crane', 'Raven', 'Puma',
  'Falcon', 'Panther', 'Cobra', 'Eagle', 'Bison', 'Jaguar', 'Viper', 'Orca',
  'Phoenix', 'Dragon', 'Griffin', 'Stallion', 'Osprey', 'Condor', 'Manta',
  'Cheetah', 'Leopard', 'Badger', 'Mongoose', 'Caracal', 'Wolverine',
]

const EMOJIS = [
  '🐯', '🦊', '🦅', '🐺', '🦦', '🐱', '🦁', '🐻', '🦋', '🐉',
  '🦄', '🦈', '🐬', '🦅', '🦉', '🦚', '🦜', '🐆', '🦓', '🦒',
  '⚡', '🔥', '🌊', '💎', '🌟', '🎯', '🚀', '💫', '🌙', '☀️',
]

const STORAGE_KEY = 'sail_identity'

export function getOrCreateIdentity() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore parse errors
  }

  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  const id = Math.random().toString(36).slice(2, 10).toUpperCase()

  const identity = { id, username: `${adj} ${animal}`, emoji }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
  } catch {
    // ignore storage errors (private browsing, etc.)
  }

  return identity
}

export function clearIdentity() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
