import React from 'react'

const ROWS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  'ZXCVBNM'.split(''),
]

export default function Keyboard({ guessedLetters, wrongLetters, onLetterClick }) {
  return (
    <div className="keyboard-section">
      {ROWS.map((row, i) => (
        <div
          key={i}
          className="keyboard-grid"
          style={{
            gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
            marginLeft:  i === 1 ? '0.6rem' : i === 2 ? '1.2rem' : 0,
            marginRight: i === 1 ? '0.6rem' : i === 2 ? '1.2rem' : 0
          }}
        >
          {row.map((letter) => {
            const isCorrect = guessedLetters.has(letter)
            const isWrong = wrongLetters.has(letter)
            const isDisabled = isCorrect || isWrong

            let className = 'key-button'
            if (isCorrect) className += ' correct'
            if (isWrong) className += ' wrong'

            return (
              <button
                key={letter}
                className={className}
                disabled={isDisabled}
                onClick={() => onLetterClick(letter)}
              >
                {letter}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
