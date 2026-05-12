import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import socket from './socket.js'
import Participant from './pages/Participant.jsx'
import Admin from './pages/Admin.jsx'
import Display from './pages/Display.jsx'

const DEFAULT_STATE = {
  questions: [],
  activeQuestionId: null,
  locked: false,
  resultsVisible: true,
  participantCount: 0,
  activeResponses: [],
  responseCounts: {},
}

export default function App() {
  const [appState, setAppState] = useState(DEFAULT_STATE)

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Participant appState={appState} socket={socket} />} />
        <Route path="/admin" element={<Admin appState={appState} socket={socket} />} />
        <Route path="/display" element={<Display appState={appState} />} />
      </Routes>
    </BrowserRouter>
  )
}
