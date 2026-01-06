import React from "react";

export default function KidsSelector({ onDailyKids, onPracticeKids, onBack }) {
  return (
    <div className="card">
      <h2>Kids Mode</h2>
      <p style={{ marginTop: "0.5rem", color: "#4b5563" }}>
        Choose a kids-friendly daily persona or practice with previous days.
      </p>

      <section style={{ textAlign: "center", marginTop: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
          <div
            className="daily-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button className="square-button daily-button" onClick={onDailyKids}>
              Kids Daily
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

          <div
            className="daily-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button className="square-button" onClick={onPracticeKids}>
              Kids Practice
            </button>
            <span style={{ visibility: "hidden", padding: "4px 10px" }}>Daily</span>
          </div>

          <button className="button-secondary" onClick={onBack}>
            Back
          </button>
        </div>
      </section>
    </div>
  );
}