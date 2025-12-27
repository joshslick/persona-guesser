import React from 'react'

export default function NameDisplay({ name, guessedLetters }) {
  const letters = Array.from(name)

  const renderChar = (ch, idx) => {
    if (ch === ' ') {
      return <div key={idx} className="name-letter-space" />
    }

    const upper = ch.toUpperCase()
    const isLetter = upper >= 'A' && upper <= 'Z'
    const shouldReveal = !isLetter || guessedLetters.has(upper)

    return (
      <div key={idx} className="name-letter-box">
        {shouldReveal ? ch : ''}
      </div>
    )
  }

  return <div className="name-display">{letters.map(renderChar)}</div>
}
