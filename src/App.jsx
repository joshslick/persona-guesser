import React, { useState } from 'react'
import ModeSelector from './components/ModeSelector'
import GamePage from './components/GamePage'
import PracticeGamePage from './components/PracticeGamePage'
import { realPersonas, fictionalPersonas } from './data/personas'
import historicalData from './data/historical.json'
import './index.css'

const historicalPersonas = historicalData.personas

export default function App() {
  // Which screen are we on? 'home' | 'daily' | 'practice'
  const [view, setView] = useState('home')

  // For the daily game, which mode? 'real' | 'fictional'
  const [dailyMode, setDailyMode] = useState('real')

  const handleSelectMode = (selectedMode) => {
    if (selectedMode === 'practice') {
      setView('practice')
    } else {
      // 'real' or 'fictional'
      setDailyMode(selectedMode)
      setView('daily')
    }
  }

  const handleBackHome = () => {
    setView('home')
  }

  let content
  if (view === 'home') {
    content = <ModeSelector onSelectMode={handleSelectMode} />
  } else if (view === 'daily') {
    const personas =
      dailyMode === 'real' ? realPersonas : fictionalPersonas

    content = (
      <GamePage
        key={dailyMode}
        mode={dailyMode}
        personas={personas}
        onBackHome={handleBackHome}
      />
    )
  } else if (view === 'practice') {
    content = (
      <PracticeGamePage
        personas={historicalPersonas}
        onBackHome={handleBackHome}
      />
    )
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1 className="logo">
          <span className="logo-persona">Persona</span>
          <span className="logo-guesser">Guesser</span>
        </h1>
      </header>
      <main className="app-main">{content}</main>
      <footer className="app-footer">
        <span>Daily persona guessing game &bull; React</span>
      </footer>
    </div>
  )
}
