import React, { useMemo, useState, useEffect } from "react";
import NameDisplay from "./NameDisplay";
import HintList from "./HintList";
import Keyboard from "./Keyboard";
import { recordDailyPlay } from "./ProfileService";
const MAX_WRONG_GUESSES = 6;

function getDayIndex() {
  const today = new Date();
  const base = new Date("2025-01-01T00:00:00Z");
  const diffMs = today.setHours(0, 0, 0, 0) - base.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getTodayPersona(personas) {
  if (!personas || personas.length === 0) return null;

  const today = new Date();
  const dayOfWeek = today.getDay();

  const schedule = personas.slice(0, 7);
  if (schedule.length === 0) return null;

  const idx = dayOfWeek % schedule.length;
  return schedule[idx];
}

function normalizeLetter(ch) {
  const code = ch.toUpperCase().charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(code);
  }
  return null;
}

function getUniqueLetters(name) {
  const set = new Set();
  for (const ch of name) {
    const letter = normalizeLetter(ch);
    if (letter) {
      set.add(letter);
    }
  }
  return set;
}

export default function GamePage({ mode, personas, onBackHome }) {
  const todayPersona = useMemo(() => getTodayPersona(personas), [personas]);
  const [guessedLetters, setGuessedLetters] = useState(() => new Set());
  const [wrongLetters, setWrongLetters] = useState(() => new Set());
  const [revealedHintCount, setRevealedHintCount] = useState(1);
  const [gameStatus, setGameStatus] = useState("playing"); // 'playing' | 'won' | 'lost'
  const [showResultModal, setShowResultModal] = useState(false);
  const [hasRecordedStreak, setHasRecordedStreak] = useState(false);
  const uniqueLetters = useMemo(() => {
    return todayPersona ? getUniqueLetters(todayPersona.name) : new Set();
  }, [todayPersona]);

  // Hydrate from localStorage so refresh doesn't reset progress for the day
  useEffect(() => {
    if (!todayPersona) return;

    const key = `personaGuesser:${mode}:${todayPersona.id}`;
    const saved = window.localStorage.getItem(key);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.date === new Date().toDateString()) {
        setGuessedLetters(new Set(parsed.guessedLetters || []));
        setWrongLetters(new Set(parsed.wrongLetters || []));
        setRevealedHintCount(parsed.revealedHintCount || 0);
        setGameStatus(parsed.gameStatus || "playing");
        setShowResultModal(
          parsed.gameStatus === "won" || parsed.gameStatus === "lost"
        );
      }
    } catch {
      // ignore
    }
  }, [mode, todayPersona]);

  // Persist state
  useEffect(() => {
    if (!todayPersona) return;
    const key = `personaGuesser:${mode}:${todayPersona.id}`;
    const payload = {
      date: new Date().toDateString(),
      guessedLetters: Array.from(guessedLetters),
      wrongLetters: Array.from(wrongLetters),
      revealedHintCount,
      gameStatus,
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  }, [
    mode,
    todayPersona,
    guessedLetters,
    wrongLetters,
    revealedHintCount,
    gameStatus,
  ]);

  useEffect(() => {
    if (!todayPersona) return;
    setHasRecordedStreak(false);
  }, [todayPersona?.id]);
  
  const handleLetterClick = (letter) => {
    if (!todayPersona || gameStatus !== "playing") return;

    const upper = letter.toUpperCase();
    if (guessedLetters.has(upper) || wrongLetters.has(upper)) return;

    const personaLetters = uniqueLetters;

    // Correct guess
    if (personaLetters.has(upper)) {
      const nextGuessed = new Set(guessedLetters);
      nextGuessed.add(upper);
      setGuessedLetters(nextGuessed);

      // Check for win
      let allGuessed = true;
      for (const needed of personaLetters) {
        if (!nextGuessed.has(needed)) {
          allGuessed = false;
          break;
        }
      }
      if (allGuessed) {
        setGameStatus("won");
        setShowResultModal(true); // show popup on win
      }
    } else {
      // Wrong guess
      const nextWrong = new Set(wrongLetters);
      nextWrong.add(upper);
      setWrongLetters(nextWrong);

      // Free hint #1 + 1 hint per wrong guess, capped at total hints
      const nextHintCount = Math.min(
        todayPersona.hints.length,
        1 + nextWrong.size
      );
      setRevealedHintCount(nextHintCount);

      // Lose after 6 wrong guesses
      if (nextWrong.size >= MAX_WRONG_GUESSES) {
        const stillMissing = Array.from(personaLetters).some(
          (ch) => !guessedLetters.has(ch)
        );
        if (stillMissing) {
          setGameStatus("lost");
          setShowResultModal(true);
        }
      }
    }
  };

  // When the player wins, record streak once
  useEffect(() => {
  if (!todayPersona) return;
  if (gameStatus === "won" && !hasRecordedStreak) {
    setHasRecordedStreak(true);
    recordDailyPlay();
  }
}, [gameStatus, hasRecordedStreak, todayPersona]);

  // Physical keyboard support
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!todayPersona || gameStatus !== "playing") return;

      const key = e.key;
      if (/^[a-zA-Z]$/.test(key)) {
        e.preventDefault();
        const letter = key.toUpperCase();
        handleLetterClick(letter);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [todayPersona, gameStatus, handleLetterClick]);

  // 🔵 Build share text (and visual preview) in ONE place
  const totalHints = todayPersona ? todayPersona.hints.length : 0;
  const hintsUsed = revealedHintCount;
  const wrongCount = wrongLetters.size;

  const statusEmoji =
    gameStatus === "won" ? "✅" : gameStatus === "lost" ? "❌" : "⏳";

  const titleLine = `PersonaGuesser – ${
    mode === "real" ? "Real" : "Fictional"
  }`;
  const dateLine = new Date().toISOString().slice(0, 10);

  const used = Math.max(0, Math.min(hintsUsed, totalHints));
  const unused = Math.max(0, totalHints - used);
  const boxes = [...Array(used).fill("🟥"), ...Array(unused).fill("🟩")];

  const rowSize = 3;
  const rows = [];
  for (let i = 0; i < boxes.length; i += rowSize) {
    rows.push(boxes.slice(i, i + rowSize).join(" "));
  }
  const boardBlock = rows.join("\n");

  const statsLine1 = `Hints used: ${hintsUsed}/${totalHints || 6}`;
  const statsLine2 = `Wrong guesses: ${wrongCount}/6 ${statusEmoji}`;
  const siteUrl = "https://personaguesser.com";
  const sharePreview =
    `${titleLine}\n` +
    `${dateLine}\n` +
    `${statsLine1}\n` +
    `${statsLine2}\n` +
    `${boardBlock}\n` +
    `${siteUrl}`;

  const handleShare = async () => {
    if (!todayPersona) return;

    
    const shareText = sharePreview;

    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        });
        return;
      } catch (err) {
        console.error("Share failed, falling back to clipboard:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert("Results copied to clipboard! You can paste them anywhere.");
    } catch {
      alert("Unable to copy results. Please manually copy from the page.");
    }
  };

  if (!todayPersona) {
    return (
      <div className="card">
        <h2>Game unavailable</h2>
        <p>There are no personas configured yet.</p>
        <button className="button-secondary" onClick={onBackHome}>
          Back home
        </button>
      </div>
    );
  }

  const isFinished = gameStatus === "won" || gameStatus === "lost";

  return (
    <div className="card">
      <div className="game-layout">
        <div className="game-header-line">
          <div>
            <h2 style={{ marginBottom: "0.15rem" }}>
              {mode === "real"
                ? "Today's Real Persona"
                : "Today's Fictional Persona"}
            </h2>
            <div className="badge">
              <span className="badge-dot" />
              <span>New puzzle every day</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="button-secondary" onClick={onBackHome}>
              Home
            </button>
          </div>
        </div>

        <section>
          <NameDisplay
            name={todayPersona.name}
            guessedLetters={guessedLetters}
          />
        </section>

        <div className="wrong-guesses-indicator">
          Wrong guesses: {wrongLetters.size}/6
        </div>

        <section className="hints-section">
          <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#374151" }}>
            Hints ({revealedHintCount}/{todayPersona.hints.length})
          </h3>
          <HintList
            category={todayPersona.category}
            hints={todayPersona.hints}
            revealedCount={revealedHintCount}
          />
        </section>

        <section className="keyboard-section">
          <Keyboard
            guessedLetters={guessedLetters}
            wrongLetters={wrongLetters}
            onLetterClick={handleLetterClick}
          />
        </section>

        {gameStatus === "won" && (
          <div className="game-status-banner game-status-win">
            Nice! You guessed {todayPersona.name}.
          </div>
        )}
        {gameStatus === "lost" && (
          <div className="game-status-banner game-status-lose">
            You&apos;re out of hints. The persona was {todayPersona.name}.
          </div>
        )}
      </div>

      {/* Result modal */}
      {showResultModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">
              {gameStatus === "won" ? "Nice! You solved it." : "Out of hints!"}
            </h3>
            <p className="modal-subtitle">
              The persona was <strong>{todayPersona.name}</strong>
            </p>

            {/* Show the exact share text so users can copy/paste manually */}
            <pre className="results-share-preview">
              {sharePreview}
            </pre>

            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              If sharing doesn&apos;t work, copy this text and paste it anywhere.
            </p>

            <div className="modal-actions">
              <button className="button-primary" onClick={handleShare}>
                Share result
              </button>
              <button
                className="button-secondary"
                onClick={() => setShowResultModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
