import React, { useMemo } from "react";
import Game from "../components/Game";
import { recordDailyPlay } from "../services/ProfileService";

function getTodayPersona(personas) {
  if (!personas || personas.length === 0) return null;

  const today = new Date();
  const dayOfMonth = today.getDate(); // 1-31

  const schedule = personas.slice(0, 30);
  if (schedule.length === 0) return null;

  const idx = (dayOfMonth - 1) % schedule.length; // Convert to 0-based index
  return schedule[idx];
}

export default function GamePage({ mode, personas, onBackHome }) {
  const todayPersona = useMemo(() => getTodayPersona(personas), [personas]);

  const persistenceKey = todayPersona
    ? `personaGuesser:${mode}:${todayPersona.id}`
    : null;

  const title = mode === "real" ? "Today's Real Persona" : "Today's Fictional Persona";

  return (
    <Game
      persona={todayPersona}
      mode={mode}
      title={title}
      isDaily={true}
      persist={true}
      persistenceKey={persistenceKey}
      onBackHome={onBackHome}
      onWin={() => recordDailyPlay()}
    />
  );
}
