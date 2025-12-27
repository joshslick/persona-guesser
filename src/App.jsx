import React, { useState } from 'react'
import ModeSelector from './components/ModeSelector'
import GamePage from './components/GamePage'
import { realPersonas, fictionalPersonas } from './data/personas'
import './index.css'

export default function App() {
  const [mode, setMode] = useState('home') // 'home' | 'real' | 'fictional'

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode)
  }

  const handleBackHome = () => {
    setMode('home')
  }

  let content
  if (mode === 'home') {
    content = <ModeSelector onSelectMode={handleSelectMode} />
  } else if (mode === 'real') {
    content = (
      <GamePage
        key="real"
        mode="real"
        personas={realPersonas}
        onBackHome={handleBackHome}
      />
    )
  } else if (mode === 'fictional') {
    content = (
      <GamePage
        key="fictional"
        mode="fictional"
        personas={fictionalPersonas}
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
    <main className="app-main">
      {content}
    </main>
    <footer className="app-footer">
      <span>Daily persona guessing game &bull; React</span>
    </footer>
  </div>
)
}
