import React from 'react'

const REAL_HINT_QUESTIONS = [
  'Man or Woman?',
  'Born – Died / Era?',
  'Visual description',
  'Main role or occupation?',
  'Country or region?',
  'Famous for what?',
]

const FICTIONAL_HINT_QUESTIONS = [
  'Man or Woman?',
  'When created / main era?',
  'Visual description',
  'Medium? (book, movie, game, comic)',
  'World / setting?',
  'Role? (wizard, superhero, etc.)',
]

export default function HintList({ category, hints, revealedCount }) {
  const questions =
    category === 'fictional' ? FICTIONAL_HINT_QUESTIONS : REAL_HINT_QUESTIONS

  const maxHints = questions.length
  const paddedHints = Array.from({ length: maxHints }).map(
    (_, idx) => hints[idx] ?? ''
  )

  return (
    <div className="hints-grid">
      {paddedHints.map((answer, idx) => {
        const revealed = idx < revealedCount
        const question = questions[idx] || `Hint ${idx + 1}`

        const cardClass = `hint-card ${
          revealed ? 'hint-card-revealed' : 'hint-card-locked'
        }`

        return (
          <div key={idx} className={cardClass}>
            <div
              style={{
                fontWeight: 600,
                marginBottom: '0.15rem',
                fontSize: '0.85rem',
              }}
            >
              {idx + 1}. {question}
            </div>

            {revealed ? (
              <div style={{ fontSize: '0.9rem' }}>
                {answer || 'No answer configured yet.'}
              </div>
            ) : (
              <div className="hint-lock">
                guess a wrong letter to reveal
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
