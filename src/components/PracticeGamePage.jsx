import React, { useState, useMemo, useEffect, useCallback } from 'react'
import NameDisplay from './NameDisplay'
import HintList from './HintList'
import Keyboard from './Keyboard'
import { useAuth } from './AuthContext'

const MAX_WRONG_GUESSES = 6
const MAX_GUEST_PRACTICE_ROUNDS = 2

function normalizeLetter(ch) {
  const code = ch.toUpperCase().charCodeAt(0)
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(code)
  }
  return null
}

function getUniqueLetters(name) {
  const set = new Set()
  for (const ch of name) {
    const letter = normalizeLetter(ch)
    if (letter) {
      set.add(letter)
    }
  }
  return set
}

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

export default function PracticeGamePage({
  personas,
  onBackHome,
  onRequireSignup,
}) {
  const [currentPersona, setCurrentPersona] = useState(null)
  const [guessedLetters, setGuessedLetters] = useState(() => new Set())
  const [wrongLetters, setWrongLetters] = useState(() => new Set())
  const [revealedHintCount, setRevealedHintCount] = useState(1)
  const [gameStatus, setGameStatus] = useState('playing') // 'playing' | 'won' | 'lost'

  const { user } = useAuth()
  const [playsToday, setPlaysToday] = useState(0)

  // Order state for “go through all personas in a random cycle”
  const [order, setOrder] = useState([]) // array of indices into personas
  const [orderPos, setOrderPos] = useState(0) // current position in order

  const uniqueLetters = useMemo(
    () => (currentPersona ? getUniqueLetters(currentPersona.name) : new Set()),
    [currentPersona]
  )

  // Load guest practice count when component mounts or when user changes
  useEffect(() => {
    if (user) {
      // logged-in users: ignore guest limit
      setPlaysToday(0)
      return
    }
    const key = getPracticeKey()
    const stored = parseInt(localStorage.getItem(key) || '0', 10)
    setPlaysToday(stored)
  }, [user])

  const incrementGuestPracticeCount = useCallback(() => {
  if (user) return // don't track for logged-in users

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
  setGuessedLetters(new Set())
  setWrongLetters(new Set())
  setRevealedHintCount(1)
  setGameStatus('playing')
    
  }, [personas, user])

  useEffect(() => {
    reseedOrder()
  }, [reseedOrder])

  const startNewGame = useCallback(() => {
    if (!personas || personas.length === 0) return
    if (!order || order.length === 0 || order.length !== personas.length) {
      // Safety: if order is missing or out-of-sync, just reseed
      reseedOrder()
      return
    }

    let nextPos = orderPos + 1
    let nextOrder = order

    // If we reached the end of the current cycle, reshuffle a new cycle
    if (nextPos >= nextOrder.length) {
      nextOrder = createShuffledIndices(personas.length)
      setOrder(nextOrder)
      nextPos = 0
    }

    setOrderPos(nextPos)

    const idx = nextOrder[nextPos]
    const nextPersona = personas[idx]

    setCurrentPersona(nextPersona)
    setGuessedLetters(new Set())
    setWrongLetters(new Set())
    setRevealedHintCount(1)
    setGameStatus('playing')
  }, [personas, order, orderPos, reseedOrder])

  // Wrapper that enforces guest limit before starting a new game
  const handleStartNewGame = useCallback(() => {
    if (!user && playsToday >= MAX_GUEST_PRACTICE_ROUNDS) {
      if (onRequireSignup) {
        onRequireSignup()
      }
      return
    }

    startNewGame()

    if (!user) {
      incrementGuestPracticeCount()
    }
  }, [user, playsToday, startNewGame, incrementGuestPracticeCount, onRequireSignup])

  const handleLetterClick = useCallback(
    (letter) => {
      if (!currentPersona || gameStatus !== 'playing') return

      const upper = letter.toUpperCase()
      if (guessedLetters.has(upper) || wrongLetters.has(upper)) return

      const personaLetters = uniqueLetters

      // ✅ Correct guess
      if (personaLetters.has(upper)) {
        const nextGuessed = new Set(guessedLetters)
        nextGuessed.add(upper)
        setGuessedLetters(nextGuessed)

        // Check for win
        let allGuessed = true
        for (const needed of personaLetters) {
          if (!nextGuessed.has(needed)) {
            allGuessed = false
            break
          }
        }
        if (allGuessed) {
          setGameStatus('won')
        }
      } else {
        //  Wrong guess
        const nextWrong = new Set(wrongLetters)
        nextWrong.add(upper)
        setWrongLetters(nextWrong)

        // Free hint #1 + 1 per wrong guess
        const nextHintCount = Math.min(
          currentPersona.hints.length,
          1 + nextWrong.size
        )
        setRevealedHintCount(nextHintCount)

        // Lose after 6 wrong guesses
        if (nextWrong.size >= MAX_WRONG_GUESSES) {
          const stillMissing = Array.from(personaLetters).some(
            (ch) => !guessedLetters.has(ch)
          )
          if (stillMissing) {
            setGameStatus('lost')
          }
        }
      }
    },
    [currentPersona, gameStatus, guessedLetters, wrongLetters, uniqueLetters]
  )

  // Physical keyboard support
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!currentPersona || gameStatus !== 'playing') return

      const key = e.key
      if (/^[a-zA-Z]$/.test(key)) {
        e.preventDefault()
        const letter = key.toUpperCase()
        handleLetterClick(letter)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentPersona, gameStatus, handleLetterClick])

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

  const wrongStrikes = `${wrongLetters.size}/${MAX_WRONG_GUESSES}`

  return (
    <div className="card">
      <div className="game-layout">
        <div className="game-header-line">
          <div>
            <h2 style={{ marginBottom: '0.15rem' }}>Practice Persona</h2>
            <div className="badge">
              <span className="badge-dot" />
              <span>Practice with previous days</span>
            </div>
            {!user && (
              <p
                style={{
                  marginTop: '0.25rem',
                  fontSize: '0.8rem',
                  color: '#6b7280',
                }}
              >
                {' '}
                {}
                {}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="button-secondary" onClick={onBackHome}>
              Home
            </button>
            <button
              className="button-primary"
              type="button"
              onClick={handleStartNewGame}
            >
              Start new game
            </button>
          </div>
        </div>

        <section>
          <NameDisplay
            name={currentPersona.name}
            guessedLetters={guessedLetters}
          />
        </section>

        <div className="wrong-guesses-indicator">
          Wrong guesses: {wrongStrikes}
        </div>

        <section className="hints-section">
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#374151' }}>
            Hints ({revealedHintCount}/{currentPersona.hints.length})
          </h3>
          <HintList
            category={currentPersona.category}
            hints={currentPersona.hints}
            revealedCount={revealedHintCount}
          />
        </section>

        <section className="keyboard-section">
          <Keyboard
            guessedLetters={guessedLetters}
            wrongLetters={wrongLetters}
            onLetterClick={handleLetterClick}
          />
        </section>

        {gameStatus === 'won' && (
          <div className="game-status-banner game-status-win">
            You solved it! The persona was {currentPersona.name}.
          </div>
        )}
        {gameStatus === 'lost' && (
          <div className="game-status-banner game-status-lose">
            Out of hints. The persona was {currentPersona.name}.
          </div>
        )}
      </div>
    </div>
  )
}
