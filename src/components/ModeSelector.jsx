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
        <h2 style={{ margin: "0" }}>DAILY PUZZLE</h2>

        <div className="mode-buttons" style={{ marginTop: "0.35rem" }}>
          <button
            className="button-primary mode-button"
            onClick={() => onSelectMode("real")}
          >
            Real Character
          </button>

          <button
            className="button-primary mode-button"
            onClick={() => onSelectMode("fictional")}
          >
            Fictional Character
          </button>
        </div>
      </section>

      {/*<section
        className="home-section"
        style={{ marginTop: "1.5rem", textAlign: "center" }}
      >
        <h2>PRACTICE</h2>
        <p style={{ marginTop: "0.25rem", color: "#4b5563" }}>
          Practice with previous days
        </p>

        <button
          className="practice-button"
          onClick={() => onSelectMode("practice")}
        >
          Start Practice Game
        </button>
      </section>*/}
    </div>
  );
}
