import React, { useEffect, useMemo, useState, useCallback } from "react";
import NameDisplay from "./NameDisplay";
import HintList from "./HintList";
import Keyboard from "./Keyboard";

const MAX_WRONG_GUESSES = 6;

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
    if (letter) set.add(letter);
  }
  return set;
}

export default function Game({
  persona,
  mode = "default",
  title,
  isDaily = false,
  onBackHome,
  onStartNewGame,
  persist = false,
  persistenceKey,
  onWin,
}) {
  const [guessedLetters, setGuessedLetters] = useState(() => new Set());
  const [wrongLetters, setWrongLetters] = useState(() => new Set());
  const usedHintsCount = Math.min(persona.hints.length, 1 + wrongLetters.size);
  const [revealedHintCount, setRevealedHintCount] = useState(1);
  const [hintsRevealedByWrongGuesses, setHintsRevealedByWrongGuesses] =
    useState(1);
  const [gameStatus, setGameStatus] = useState("playing");
  const [showResultModal, setShowResultModal] = useState(false);
  const [hasRecordedWin, setHasRecordedWin] = useState(false);
  const [hintsUsedByPlayer, setHintsUsedByPlayer] = useState(false);
  const [autoRevealedHints, setAutoRevealedHints] = useState(false);

  const uniqueLetters = useMemo(
    () => (persona ? getUniqueLetters(persona.name) : new Set()),
    [persona],
  );

  // hydrate persisted game state for daily modes
  useEffect(() => {
    if (!persona || !persist || !persistenceKey) return;

    const saved = window.localStorage.getItem(persistenceKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.date === new Date().toDateString()) {
        setGuessedLetters(new Set(parsed.guessedLetters || []));
        setWrongLetters(new Set(parsed.wrongLetters || []));
        setRevealedHintCount(parsed.revealedHintCount || 1);
        setHintsRevealedByWrongGuesses(parsed.hintsRevealedByWrongGuesses || 1);
        setGameStatus(parsed.gameStatus || "playing");
        setShowResultModal(
          parsed.gameStatus === "won" || parsed.gameStatus === "lost",
        );
        setHintsUsedByPlayer(parsed.hintsUsedByPlayer || false);
        setAutoRevealedHints(parsed.autoRevealedHints || false);
      }
    } catch {
      // ignore
    }
  }, [persona, persist, persistenceKey]);

  // persist
  useEffect(() => {
    if (!persona || !persist || !persistenceKey) return;
    const payload = {
      date: new Date().toDateString(),
      guessedLetters: Array.from(guessedLetters),
      wrongLetters: Array.from(wrongLetters),
      revealedHintCount,
      hintsRevealedByWrongGuesses,
      gameStatus,
      hintsUsedByPlayer,
      autoRevealedHints,
    };
    window.localStorage.setItem(persistenceKey, JSON.stringify(payload));
  }, [
    persona,
    persist,
    persistenceKey,
    guessedLetters,
    wrongLetters,
    revealedHintCount,
    hintsRevealedByWrongGuesses,
    gameStatus,
    hintsUsedByPlayer,
    autoRevealedHints,
  ]);

  // For non-persisted modes (practice), reset internal state when persona changes
  useEffect(() => {
    if (!persona) return;
    if (!persist) {
      setGuessedLetters(new Set());
      setWrongLetters(new Set());
      setRevealedHintCount(1);
      setHintsRevealedByWrongGuesses(1);
      setGameStatus("playing");
      setShowResultModal(false);
      setHintsUsedByPlayer(false);
      setAutoRevealedHints(false);
    }
  }, [persona?.id, persist]);

  useEffect(() => {
    // reset recorded flag when persona changes
    setHasRecordedWin(false);
  }, [persona?.id]);

  const handleLetterClick = useCallback(
    (letter) => {
      if (!persona || gameStatus !== "playing") return;
      const upper = letter.toUpperCase();
      if (guessedLetters.has(upper) || wrongLetters.has(upper)) return;

      const personaLetters = uniqueLetters;
      if (personaLetters.has(upper)) {
        const nextGuessed = new Set(guessedLetters);
        nextGuessed.add(upper);
        setGuessedLetters(nextGuessed);

        // check win
        let allGuessed = true;
        for (const needed of personaLetters) {
          if (!nextGuessed.has(needed)) {
            allGuessed = false;
            break;
          }
        }
        if (allGuessed) {
          setGameStatus("won");
          setShowResultModal(true);
          setAutoRevealedHints(!hintsUsedByPlayer);
          // If player won without using hints, keep revealedHintCount as is but mark as auto-revealed
        }
      } else {
        const nextWrong = new Set(wrongLetters);
        nextWrong.add(upper);
        setWrongLetters(nextWrong);
        setHintsUsedByPlayer(true);

        const nextHintCount = Math.min(
          persona.hints.length,
          1 + nextWrong.size,
        );
        setRevealedHintCount(nextHintCount);
        setHintsRevealedByWrongGuesses(nextHintCount);

        if (nextWrong.size >= MAX_WRONG_GUESSES) {
          const stillMissing = Array.from(personaLetters).some(
            (ch) => !guessedLetters.has(ch),
          );
          if (stillMissing) {
            setGameStatus("lost");
            setShowResultModal(true);
          }
        }
      }
    },
    [
      persona,
      gameStatus,
      guessedLetters,
      wrongLetters,
      uniqueLetters,
      hintsUsedByPlayer,
    ],
  );

  // call onWin once when player wins
  useEffect(() => {
    if (!persona) return;
    if (gameStatus === "won" && !hasRecordedWin) {
      setHasRecordedWin(true);
      if (onWin) onWin();
    }
  }, [gameStatus, hasRecordedWin, onWin, persona]);

  // keyboard support
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!persona || gameStatus !== "playing") return;
      const key = e.key;
      if (/^[a-zA-Z]$/.test(key)) {
        e.preventDefault();
        handleLetterClick(key.toUpperCase());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [persona, gameStatus, handleLetterClick]);

  if (!persona) {
    return (
      <div className="card">
        <h2>Game unavailable</h2>
        <p>No personas configured yet.</p>
        <button className="button-secondary" onClick={onBackHome}>
          Back home
        </button>
      </div>
    );
  }

  // share preview
  const totalHints = persona ? persona.hints.length : 0;

  const wrongCount = wrongLetters.size;
  const usedHints = Math.min(totalHints, 1 + wrongCount); // 1 free hint + wrong guesses
  const statusEmoji =
    gameStatus === "won" ? "✅" : gameStatus === "lost" ? "❌" : "⏳";
  const titleLine = title || `${mode}`;
  const dateLine = new Date().toLocaleDateString("en-CA");

  // boxes should reflect USED vs UNUSED (not visible vs hidden)
  const used = usedHints;
  const unused = Math.max(0, totalHints - used);

  const boxes = [...Array(used).fill("🟥"), ...Array(unused).fill("🟩")];

  const rowSize = 3;
  const rows = [];
  for (let i = 0; i < boxes.length; i += rowSize)
    rows.push(boxes.slice(i, i + rowSize).join(" "));
  const boardBlock = rows.join("\n");

  const statsLine1 = `Hints used: ${usedHints}/${totalHints || 6}`;
  const statsLine2 = `Wrong guesses: ${wrongCount}/6 ${statusEmoji}`;
  const siteUrl = "https://personaguesser.com";

  const sharePreview = `${titleLine}\n${dateLine}\n${statsLine1}\n${statsLine2}\n${boardBlock}\n${siteUrl}`;

  const handleShare = async () => {
    if (!persona) return;
    const shareText = sharePreview;
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
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

  const isFinished = gameStatus === "won" || gameStatus === "lost";

  return (
    <div className="card">
      <div className="game-layout">
        <div className="game-header-line">
          <div>
            <h2 style={{ marginBottom: "0.15rem" }}>{title}</h2>
            <div className="badge">
              <span className="badge-dot" />
              <span>
                {isDaily
                  ? "New puzzle every day"
                  : "Practice with previous days"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="button-secondary" onClick={onBackHome}>
              Home
            </button>
            {onStartNewGame && (
              <button
                className="button-primary"
                type="button"
                onClick={onStartNewGame}
              >
                Start new game
              </button>
            )}
          </div>
        </div>

        <section>
          <NameDisplay name={persona.name} guessedLetters={guessedLetters} />
        </section>

        <div className="wrong-guesses-indicator">
          Wrong guesses: {wrongLetters.size}/6
        </div>

        <section className="hints-section">
          <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#374151" }}>
            Hints ({revealedHintCount}/{persona.hints.length})
          </h3>
          <HintList
            category={persona.category}
            hints={persona.hints}
            revealedCount={revealedHintCount}
            mode={mode}
            gameStatus={gameStatus}
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
            Nice! You guessed {persona.name}.
          </div>
        )}
        {gameStatus === "lost" && (
          <div className="game-status-banner game-status-lose">
            You&apos;re out of hints. The persona was {persona.name}.
          </div>
        )}
      </div>

      {showResultModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">
              {gameStatus === "won" ? "Nice! You solved it." : "Out of hints!"}
            </h3>
            <p className="modal-subtitle">
              The persona was <strong>{persona.name}</strong>
            </p>

            {isDaily && (
              <>
                <pre className="results-share-preview">{sharePreview}</pre>
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.8rem",
                    color: "#6b7280",
                  }}
                >
                  If sharing doesn&apos;t work, copy this text and paste it
                  anywhere.
                </p>
              </>
            )}

            <div className="modal-actions">
              {isDaily ? (
                <button className="button-primary" onClick={handleShare}>
                  Share result
                </button>
              ) : (
                onStartNewGame && (
                  <button
                    className="button-primary"
                    onClick={() => {
                      setShowResultModal(false);
                      onStartNewGame();
                    }}
                  >
                    Start new game
                  </button>
                )
              )}
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
