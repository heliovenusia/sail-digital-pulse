require('dotenv').config()

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')
const state = require('./state')

const app = express()
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors())
app.use(express.json({ limit: '10kb' }))

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitize(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 200)
}

function checkAdmin(password) {
  return password === ADMIN_PASSWORD
}

function broadcast(event, data) {
  io.emit(event, data)
}

// ── REST endpoints ────────────────────────────────────────────────────────────

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {}
  if (password === ADMIN_PASSWORD) {
    res.json({ ok: true })
  } else {
    res.status(401).json({ ok: false, error: 'Invalid password' })
  }
})

app.get('/api/state', (req, res) => {
  res.json(state.getPublicState())
})

// ── Socket.IO ─────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  // Send full state to newly connected client
  socket.emit('state:full', state.getPublicState())

  // ── Participant events ──────────────────────────────────────────────────────

  socket.on('participant:join', (data) => {
    if (!data || !data.id) return
    const participant = {
      id: sanitize(data.id),
      username: sanitize(data.username || 'Anonymous'),
      emoji: sanitize(data.emoji || '👤'),
    }
    const joined = state.addParticipant(participant)
    if (joined) {
      broadcast('participant:joined', { participantCount: state.getPublicState().participantCount })
    }
  })

  socket.on('response:submit', (data) => {
    if (!data || !data.participantId || !data.questionId || !data.text) return
    if (state.getPublicState().locked) return

    const participantId = sanitize(data.participantId)
    const questionId = sanitize(data.questionId)
    const text = sanitize(data.text)

    if (!text) return

    state.submitResponse(participantId, questionId, text)
    const pub = state.getPublicState()
    broadcast('responses:updated', {
      questionId,
      activeResponses: pub.activeResponses,
      responseCounts: pub.responseCounts,
    })
  })

  // ── Admin events ────────────────────────────────────────────────────────────

  socket.on('admin:create:question', (data) => {
    if (!checkAdmin(data?.password)) return socket.emit('admin:error', { error: 'Unauthorized' })
    const text = sanitize(data.text)
    if (!text) return
    const question = state.createQuestion(text)
    broadcast('state:full', state.getPublicState())
  })

  socket.on('admin:activate', (data) => {
    if (!checkAdmin(data?.password)) return socket.emit('admin:error', { error: 'Unauthorized' })
    const ok = state.activateQuestion(data.questionId)
    if (ok) broadcast('state:full', state.getPublicState())
  })

  socket.on('admin:next', (data) => {
    if (!checkAdmin(data?.password)) return socket.emit('admin:error', { error: 'Unauthorized' })
    state.nextQuestion()
    broadcast('state:full', state.getPublicState())
  })

  socket.on('admin:prev', (data) => {
    if (!checkAdmin(data?.password)) return socket.emit('admin:error', { error: 'Unauthorized' })
    state.prevQuestion()
    broadcast('state:full', state.getPublicState())
  })

  socket.on('admin:lock', (data) => {
    if (!checkAdmin(data?.password)) return socket.emit('admin:error', { error: 'Unauthorized' })
    state.setLock(!!data.locked)
    broadcast('lock:changed', { locked: data.locked })
  })

  socket.on('admin:results', (data) => {
    if (!checkAdmin(data?.password)) return socket.emit('admin:error', { error: 'Unauthorized' })
    state.setResultsVisible(!!data.visible)
    broadcast('results:visibility', { visible: data.visible })
  })

  socket.on('admin:reset:question', (data) => {
    if (!checkAdmin(data?.password)) return socket.emit('admin:error', { error: 'Unauthorized' })
    state.resetQuestion(data.questionId)
    broadcast('state:full', state.getPublicState())
  })

  socket.on('admin:reset:session', (data) => {
    if (!checkAdmin(data?.password)) return socket.emit('admin:error', { error: 'Unauthorized' })
    state.resetSession()
    broadcast('session:reset', state.getPublicState())
  })
})

// ── Static files ──────────────────────────────────────────────────────────────
// process.cwd() is more reliable than __dirname on Render/Railway because
// the working directory is always the repo root regardless of how Node resolves
// the script path.

const distPath = path.join(process.cwd(), 'client', 'dist')
const indexHtml = path.join(distPath, 'index.html')

if (fs.existsSync(indexHtml)) {
  // 1. Explicitly serve /assets/* first so Vite's hashed bundles are never
  //    caught by any downstream middleware.
  app.use(
    '/assets',
    express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',    // safe: Vite content-hashes every filename
      immutable: true,
    })
  )

  // 2. Serve everything else in dist (favicon, manifest, etc.)
  app.use(express.static(distPath, { maxAge: '1h' }))

  // 3. SPA catch-all: return index.html for React Router paths.
  //    Regex excludes /api/* and /socket.io/* so those are never intercepted.
  app.get(/^(?!\/(api|socket\.io))/, (req, res) => {
    res.sendFile(indexHtml)
  })
} else {
  app.get('/', (req, res) => {
    res.send('SAIL Digital Pulse — run "npm run build" first, then restart the server.')
  })
}

// ── Start ─────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`[server] SAIL Digital Pulse listening on port ${PORT}`)
  console.log(`[server] Admin password: ${ADMIN_PASSWORD === 'admin123' ? '⚠ default (change ADMIN_PASSWORD)' : '✓ set'}`)
})
