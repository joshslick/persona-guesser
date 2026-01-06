import React from "react";

export default function ModeSelector({ onSelectMode }) {
  return (
    <div className="card">
      <h2>Welcome to PersonaGuesser</h2>

      <p style={{ marginTop: "0.5rem", color: "#4b5563" }}>
        Guess today's hidden persona by selecting letters. Each wrong letter
        unlocks one of six hints. Run out of hints before you solve the name,
        and you lose!
      </p>

      <p style={{ marginTop: "0.5rem", color: "#4b5563" }}>
        Choose whether you want to guess a <strong>real person</strong> or a{" "}
        <strong>fictional character</strong>. A new pair of personas appears
        each day.
      </p>

      <section style={{ textAlign: "center", marginTop: "0.5rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.4rem",
          }}
        >
          {/* REAL DAILY */}
          <div
            className="daily-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button
              className="square-button daily-button"
              onClick={() => onSelectMode("real")}
            >
              Real Persona
            </button>
            <span
              className="daily-badge"
              style={{
                background: "#facc15",
                color: "#000",
                fontSize: "0.7rem",
                padding: "4px 10px",
                borderRadius: "999px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
              }}
            >
              Daily
            </span>
          </div>

          {/* FICTIONAL DAILY */}
          <div
            className="daily-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button
              className="square-button daily-button"
              onClick={() => onSelectMode("fictional")}
            >
              Fictional Persona
            </button>
            <span
              className="daily-badge"
              style={{
                background: "#facc15",
                color: "#000",
                fontSize: "0.7rem",
                padding: "4px 10px",
                borderRadius: "999px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
              }}
            >
              Daily
            </span>
          </div>

          {/* PRACTICE */}
          <div
            className="daily-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button
              className="square-button"
              onClick={() => onSelectMode("practice")}
            >
              Practice Mode
            </button>
            <span
              style={{
                visibility: "hidden",
                padding: "4px 10px",
              }}
            >
              Daily
            </span>
          </div>

          {/* (Kids mode moved to Other modes page) */}
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
        <button
          className="other-modes-button"
          onClick={() => onSelectMode('other')}
          aria-label="Other modes"
        >
          Other modes
        </button>
      </div>
    </div>
  );
}
