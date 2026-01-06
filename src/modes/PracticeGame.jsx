import React, { useState, useEffect, useCallback } from 'react'
import Game from '../components/Game'
import { useAuth } from '../services/AuthContext'

const MAX_GUEST_PRACTICE_ROUNDS = 2

// Fisher–Yates shuffle
function createShuffledIndices(length) {
  const arr = Array.from({ length }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getPracticeKey() {
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
  return `personaGuesser:practice:${today}`
}

export default function PracticeGame({ personas, onBackHome, onRequireSignup, mode }) {
  const [currentPersona, setCurrentPersona] = useState(null)

  const { user } = useAuth()
  const [playsToday, setPlaysToday] = useState(0)

  // Order state for “go through all personas in a random cycle”
  const [order, setOrder] = useState([])
  const [orderPos, setOrderPos] = useState(0)

  // Load guest practice count when component mounts or when user changes
  useEffect(() => {
    if (user) {
      setPlaysToday(0)
      return
    }
    const key = getPracticeKey()
    const stored = parseInt(localStorage.getItem(key) || '0', 10)
    setPlaysToday(stored)
  }, [user])

  const incrementGuestPracticeCount = useCallback(() => {
    if (user) return
    const key = getPracticeKey()
    setPlaysToday((prev) => {
      const stored = parseInt(localStorage.getItem(key) || '0', 10)
      const base = Number.isNaN(stored) ? 0 : stored
      const next = base + 1
      localStorage.setItem(key, String(next))
      return next
    })
  }, [user])

  // Initialize / reinitialize the random order when personas change
  const reseedOrder = useCallback(() => {
    console.debug('[PracticeGame] reseedOrder - personas.length=', personas?.length)
    if (!personas || personas.length === 0) {
      setOrder([])
      setOrderPos(0)
      setCurrentPersona(null)
      return
    }

    const indices = createShuffledIndices(personas.length)
    setOrder(indices)
    setOrderPos(0)

    const firstPersona = personas[indices[0]]
    setCurrentPersona(firstPersona)
    console.debug('[PracticeGame] reseedOrder -> firstPersona.id=', firstPersona?.id)
  }, [personas])

  useEffect(() => {
    reseedOrder()
  }, [reseedOrder])

  const startNewGame = useCallback(() => {
    try {
      console.debug('[PracticeGame] startNewGame before', { orderLength: order.length, orderPos, personasLength: personas?.length })
      if (!personas || personas.length === 0) return
      if (!order || order.length === 0 || order.length !== personas.length) {
        console.debug('[PracticeGame] startNewGame -> order out-of-sync, reseeding')
        reseedOrder()
        return
      }

      let nextPos = orderPos + 1
      let nextOrder = order
      if (nextPos >= nextOrder.length) {
        nextOrder = createShuffledIndices(personas.length)
        setOrder(nextOrder)
        nextPos = 0
        console.debug('[PracticeGame] startNewGame -> wrapped and reshuffled')
      }

      setOrderPos(nextPos)

      const idx = nextOrder[nextPos]
      const nextPersona = personas[idx]
      setCurrentPersona(nextPersona)
      console.debug('[PracticeGame] startNewGame -> nextPersona.id=', nextPersona?.id, 'nextPos=', nextPos)
    } catch (err) {
      console.error('[PracticeGame] startNewGame error', err)
    }
  }, [personas, order, orderPos, reseedOrder])

  // Wrapper that enforces guest limit before starting a new game
  const handleStartNewGame = useCallback(() => {
    if (!user && playsToday >= MAX_GUEST_PRACTICE_ROUNDS) {
      if (onRequireSignup) onRequireSignup()
      return
    }

    startNewGame()

    if (!user) incrementGuestPracticeCount()
  }, [user, playsToday, startNewGame, incrementGuestPracticeCount, onRequireSignup])

  if (!currentPersona) {
    return (
      <div className="card">
        <h2>Practice mode unavailable</h2>
        <p>No historical personas configured yet.</p>
        <button className="button-secondary" onClick={onBackHome}>
          Home
        </button>
      </div>
    )
  }

  return (
    <Game
      persona={currentPersona}
      mode={mode}
      title={'Practice Persona'}
      isDaily={false}
      persist={false}
      onBackHome={onBackHome}
      onStartNewGame={handleStartNewGame}
    />
  )
}

function getUniqueLetters(name) {
  if (!name || typeof name !== "string") {
    console.warn("[Game] getUniqueLetters: invalid name", name);
    return new Set();
  }
  const set = new Set();
  for (const ch of name) {
    const letter = normalizeLetter(ch);
    if (letter) set.add(letter);
  }
  return set;
}
