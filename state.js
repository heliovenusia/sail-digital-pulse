const fs = require('fs')
const path = require('path')

const BACKUP_FILE = path.join(__dirname, 'state_backup.json')

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

let state = {
  questions: [],
  activeQuestionId: null,
  locked: false,
  resultsVisible: true,
  participants: new Map(),
  responses: new Map(),
}

// Try to restore from backup on startup
try {
  const raw = fs.readFileSync(BACKUP_FILE, 'utf8')
  const saved = JSON.parse(raw)
  state.questions = saved.questions || []
  state.activeQuestionId = saved.activeQuestionId || null
  state.locked = saved.locked || false
  state.resultsVisible = saved.resultsVisible !== undefined ? saved.resultsVisible : true
  if (saved.participants) {
    state.participants = new Map(Object.entries(saved.participants))
  }
  if (saved.responses) {
    for (const [qid, resMap] of Object.entries(saved.responses)) {
      state.responses.set(qid, new Map(Object.entries(resMap)))
    }
  }
  console.log('[state] Restored from backup')
} catch {
  console.log('[state] Starting fresh (no backup found)')
}

function saveBackup() {
  try {
    const serialized = {
      questions: state.questions,
      activeQuestionId: state.activeQuestionId,
      locked: state.locked,
      resultsVisible: state.resultsVisible,
      participants: Object.fromEntries(state.participants),
      responses: Object.fromEntries(
        [...state.responses.entries()].map(([qid, resMap]) => [qid, Object.fromEntries(resMap)])
      ),
    }
    fs.writeFile(BACKUP_FILE, JSON.stringify(serialized, null, 2), () => {})
  } catch (err) {
    console.error('[state] Backup write failed:', err.message)
  }
}

function getResponsesForQuestion(questionId) {
  const resMap = state.responses.get(questionId)
  if (!resMap) return []
  return [...resMap.values()].map(r => r.text)
}

function getPublicState() {
  const activeResponses = state.activeQuestionId
    ? getResponsesForQuestion(state.activeQuestionId)
    : []

  const responseCounts = {}
  for (const [qid, resMap] of state.responses.entries()) {
    responseCounts[qid] = resMap.size
  }

  return {
    questions: state.questions,
    activeQuestionId: state.activeQuestionId,
    locked: state.locked,
    resultsVisible: state.resultsVisible,
    participantCount: state.participants.size,
    activeResponses,
    responseCounts,
  }
}

function addParticipant(participant) {
  if (state.participants.size >= 100 && !state.participants.has(participant.id)) {
    return false
  }
  state.participants.set(participant.id, { ...participant, joinedAt: Date.now() })
  saveBackup()
  return true
}

function submitResponse(participantId, questionId, text) {
  if (!state.responses.has(questionId)) {
    state.responses.set(questionId, new Map())
  }
  state.responses.get(questionId).set(participantId, { text, submittedAt: Date.now() })
  saveBackup()
}

function activateQuestion(id) {
  const exists = state.questions.find(q => q.id === id)
  if (!exists) return false
  state.activeQuestionId = id
  saveBackup()
  return true
}

function nextQuestion() {
  if (state.questions.length === 0) return false
  const idx = state.questions.findIndex(q => q.id === state.activeQuestionId)
  const nextIdx = idx === -1 ? 0 : Math.min(idx + 1, state.questions.length - 1)
  state.activeQuestionId = state.questions[nextIdx].id
  saveBackup()
  return true
}

function prevQuestion() {
  if (state.questions.length === 0) return false
  const idx = state.questions.findIndex(q => q.id === state.activeQuestionId)
  const prevIdx = idx <= 0 ? 0 : idx - 1
  state.activeQuestionId = state.questions[prevIdx].id
  saveBackup()
  return true
}

function setLock(locked) {
  state.locked = locked
  saveBackup()
}

function setResultsVisible(visible) {
  state.resultsVisible = visible
  saveBackup()
}

function resetQuestion(questionId) {
  state.responses.delete(questionId)
  saveBackup()
}

function resetSession() {
  state.questions = []
  state.activeQuestionId = null
  state.locked = false
  state.resultsVisible = true
  state.participants = new Map()
  state.responses = new Map()
  saveBackup()
}

function createQuestion(text) {
  const question = { id: makeId(), text, createdAt: Date.now() }
  state.questions.push(question)
  saveBackup()
  return question
}

module.exports = {
  getPublicState,
  addParticipant,
  submitResponse,
  activateQuestion,
  nextQuestion,
  prevQuestion,
  setLock,
  setResultsVisible,
  resetQuestion,
  resetSession,
  createQuestion,
}
