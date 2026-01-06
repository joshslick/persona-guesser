import React from "react";

export default function OtherModes({ onOpenKids, onBack }) {
  return (
    <div className="card">
      <h2>Other Modes</h2>
      <p style={{ marginTop: "0.5rem", color: "#4b5563" }}>
        Extra themed modes — more coming soon.
      </p>

      <section style={{ textAlign: "center", marginTop: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button className="square-button" onClick={onOpenKids}>
              Kids Mode
            </button>
            <span style={{ color: "#6b7280", fontSize: "0.9rem" }}></span>
          </div>

          <button className="button-secondary" onClick={onBack}>
            Back
          </button>
        </div>
      </section>
    </div>
  );
}