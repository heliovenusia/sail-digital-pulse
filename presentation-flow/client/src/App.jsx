import { useState, useEffect } from 'react'
import socket from './socket.js'
import Participant from './pages/Participant.jsx'
import Admin from './pages/PresenterAdmin.jsx'
import Display from './pages/PresentationDisplay.jsx'

const DEFAULT_STATE = {
  questions: [],
  activeQuestionId: null,
  locked: false,
  resultsVisible: true,
  participantCount: 0,
  activeResponses: [],
  responseCounts: {},
  presentationStage: 'welcome',
}

export default function App() {
  const [appState, setAppState] = useState(DEFAULT_STATE)
  const [mode, setMode] = useState(() => window.name === 'sail-presentation' ? 'display' : 'participant')

  useEffect(() => {
    socket.on('state:full', (data) => {
      setAppState(data)
    })

    socket.on('session:reset', (data) => {
      setAppState(data)
    })

    socket.on('question:activated', (data) => {
      setAppState(prev => ({ ...prev, activeQuestionId: data.activeQuestionId }))
    })

    socket.on('responses:updated', (data) => {
      setAppState(prev => ({
        ...prev,
        activeResponses: data.activeResponses,
        responseCounts: data.responseCounts,
      }))
    })

    socket.on('lock:changed', (data) => {
      setAppState(prev => ({ ...prev, locked: data.locked }))
    })

    socket.on('results:visibility', (data) => {
      setAppState(prev => ({ ...prev, resultsVisible: data.visible }))
    })

    socket.on('participant:joined', (data) => {
      setAppState(prev => ({ ...prev, participantCount: data.participantCount }))
    })

    return () => {
      socket.off('state:full')
      socket.off('session:reset')
      socket.off('question:activated')
      socket.off('responses:updated')
      socket.off('lock:changed')
      socket.off('results:visibility')
      socket.off('participant:joined')
    }
  }, [])

  function openPresentation() {
    const presentation = window.open('/', 'sail-presentation')
    presentation?.focus()
  }

  if (mode === 'display') return <Display appState={appState} />
  if (mode === 'presenter') {
    return <Admin appState={appState} socket={socket} onExit={() => setMode('participant')} onPresent={openPresentation} />
  }

  return <div style={{ position: 'relative' }}>
    <Participant appState={appState} socket={socket} />
    <button onClick={() => setMode('presenter')} aria-label="Presenter access" style={{ position: 'fixed', right: 12, bottom: 10, zIndex: 20, border: 0, background: 'transparent', color: 'rgba(148,163,184,.42)', fontSize: 11, cursor: 'pointer', padding: 6 }}>Presenter access</button>
  </div>
}
