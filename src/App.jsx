// src/App.jsx
import React, { useState, useEffect } from "react";
import ModeSelector from "./components/ModeSelector";
import GamePage from "./components/GamePage";
import PracticeGamePage from "./components/PracticeGamePage";
import { realPersonas, fictionalPersonas } from "./data/personas";
import historicalData from "./data/historical.json";
import "./index.css";

import { AuthProvider, useAuth } from "./components/AuthContext";
import { getOrCreateProfile } from "./components/ProfileService";
import { supabase } from "./components/supabaseClient";
import AuthModal from "./components/AuthModal"; 

const historicalPersonas = historicalData.personas;

function AppShell() {
  // Which screen are we on? 'home' | 'daily' | 'practice'
  const [view, setView] = useState("home");

  // For the daily game, which mode? 'real' | 'fictional'
  const [dailyMode, setDailyMode] = useState("real");

  // Auth modal state
  const [authMode, setAuthMode] = useState(null); // 'login' | 'signup' | null
  const [upgradeMessage, setUpgradeMessage] = useState(null);

  const { user } = useAuth();
  const [streak, setStreak] = useState(null);

  //  Load streak when user logs in / changes
  useEffect(() => {
    if (!user) {
      setStreak(null);
      return;
    }

    (async () => {
      const profile = await getOrCreateProfile();
      if (profile) {
        setStreak(profile.current_streak ?? 0);
      }
    })();
  }, [user]);

  const handleSelectMode = (selectedMode) => {
    if (selectedMode === "practice") {
      setView("practice");
    } else {
      // 'real' or 'fictional'
      setDailyMode(selectedMode);
      setView("daily");
    }
  };

  const handleBackHome = () => {
    setView("home");
  };

  const handleRequireSignup = () => {
    setUpgradeMessage(
      ""
    );
    setAuthMode("signup");
  };

  let content;
  if (view === "home") {
    content = <ModeSelector onSelectMode={handleSelectMode} />;
  } else if (view === "daily") {
    const personas = dailyMode === "real" ? realPersonas : fictionalPersonas;

    content = (
      <GamePage
        key={dailyMode}
        mode={dailyMode}
        personas={personas}
        onBackHome={handleBackHome}
      />
    );
  } else if (view === "practice") {
    content = (
      <PracticeGamePage
        personas={historicalPersonas}
        onBackHome={handleBackHome}
        onRequireSignup={handleRequireSignup}
      />
    );
  }

  return (
    <>
      <div className="app-root">
        <header className="app-header">
          <h1 className="logo">
            <span className="logo-persona">Persona</span>
            <span className="logo-guesser">Guesser</span>
          </h1>

          {/* Auth + streak display */}
          <div className="header-auth">
            {user ? (
              <>
                <span className="header-user-email">{user.email}</span>
                {streak !== null && (
                  <span className="header-streak">🔥 Streak: {streak}</span>
                )}
                {/*<button
                  className="header-btn"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setView("home");
                  }}
                >
                  Logout
                </button>*/}
              </>
            ) : (
              <>
                <button
                  className="header-btn header-btn-signup"
                  onClick={() => {
                    setUpgradeMessage(null);
                    setAuthMode("login");
                  }}
                >
                  Log in
                </button>
                <button
                  className="header-btn header-btn-signup"
                  onClick={() => {
                    setUpgradeMessage(null);
                    setAuthMode("signup");
                  }}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </header>

        <main className="app-main">{content}</main>
        <footer className="app-footer">
          <span>Daily persona guessing game &bull; React</span>
        </footer>
      </div>

      {/* Auth modal */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => {
            setAuthMode(null);
            setUpgradeMessage(null);
          }}
          upgradeMessage={upgradeMessage}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
