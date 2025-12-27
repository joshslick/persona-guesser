import React from 'react'

export default function ModeSelector({ onSelectMode }) {
  return (
    <div className="card">
      <h2>Welcome to PersonaGuesser</h2>
      <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>
        Guess today's hidden persona by selecting letters. Each wrong letter unlocks
        one of six hints. Run out of hints before you solve the name, and you lose!
      </p>
      <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>
        Choose whether you want to guess a <strong>real person</strong> or a{' '}
        <strong>fictional character</strong>. A new pair of personas appears each day.
      </p>
      <div className="mode-buttons">
        <button
          className="button-primary mode-button"
          onClick={() => onSelectMode('real')}
        >
          Real Character
        </button>
        <button
          className="button-primary mode-button"
          onClick={() => onSelectMode('fictional')}
        >
          Fictional Character
        </button>
      </div>
    </div>
  )
}
