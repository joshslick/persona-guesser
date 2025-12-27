import React from 'react'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function Keyboard({ guessedLetters, wrongLetters, onLetterClick }) {
  return (
    <div className="keyboard-grid">
      {LETTERS.map((letter) => {
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
  )
}
