// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ModeSelector from "./components/ModeSelector";
import GamePage from "./pages/GamePage";
import PracticeGamePage from "./pages/PracticeGamePage";
import { realPersonas, fictionalPersonas } from "./data/personas";
import historicalData from "./data/historical.json";
import { kidsPersonas } from "./data/Persons_kids";
import historicalKids from "./data/historical_kids.json";
import OtherModes from "./modes/OtherModes";
import KidsSelector from "./modes/KidsSelector";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import "./index.css";

import { AuthProvider, useAuth } from "./services/AuthContext";
import { getOrCreateProfile } from "./services/ProfileService";
import AuthModal from "./components/AuthModal";

const historicalPersonas = historicalData.personas;

function AppShell() {
  const [view, setView] = useState("home");
  const [dailyMode, setDailyMode] = useState("real");
  const [kidsModeView, setKidsModeView] = useState(null);
  const [practiceMode, setPracticeMode] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [upgradeMessage, setUpgradeMessage] = useState(null);

  const { user } = useAuth();
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    if (!user) {
      setStreak(null);
      return;
    }
    (async () => {
      const profile = await getOrCreateProfile();
      if (profile) setStreak(profile.current_streak ?? 0);
    })();
  }, [user]);

  const handleSelectMode = (selectedMode) => {
    if (selectedMode === "practice") {
      setPracticeMode(null);
      setView("practice");
    } else if (selectedMode === "other") {
      setView("other");
    } else {
      setDailyMode(selectedMode);
      setView("daily");
    }
  };

  const handleBackHome = () => setView("home");

  const handleRequireSignup = () => {
    setUpgradeMessage("");
    setAuthMode("signup");
  };

  let content;
  if (view === "home") {
    content = <ModeSelector onSelectMode={handleSelectMode} />;
  } else if (view === "other") {
    content = (
      <OtherModes
        onOpenKids={() => {
          setKidsModeView("kids");
          setView("kids");
        }}
        onBack={() => setView("home")}
      />
    );
  } else if (view === "kids") {
    content = (
      <KidsSelector
        onDailyKids={() => {
          setDailyMode("kids");
          setView("daily");
        }}
        onPracticeKids={() => {
          setPracticeMode("kids");
          setView("practice");
        }}
        onBack={() => setView("home")}
      />
    );
  } else if (view === "daily") {
    const personas =
      dailyMode === "real"
        ? realPersonas
        : dailyMode === "fictional"
        ? fictionalPersonas
        : kidsPersonas;

    content = (
      <GamePage key={dailyMode} mode={dailyMode} personas={personas} onBackHome={handleBackHome} />
    );
  } else if (view === "practice") {
    const practicePersonas =
      practiceMode === "kids" ? historicalKids.personas : historicalPersonas;

    content = (
      <PracticeGamePage
        personas={practicePersonas}
        mode={practiceMode}
        onBackHome={handleBackHome}
        onRequireSignup={handleRequireSignup}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="app-root">
        <header className="app-header">
          <h1 className="logo">
            <span className="logo-persona">Persona</span>
            <span className="logo-guesser">Guesser</span>
          </h1>

          <div className="header-auth">
            {user ? (
              <>
                <span className="header-user-email">{user.email}</span>
                {streak !== null && <span className="header-streak">🔥 Streak: {streak}</span>}
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

        <nav className="topnav">
          <Link to="/">Home</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={content} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <span>Daily persona guessing game &bull; React</span>
          <div style={{ marginTop: 8 }}>
            <Link to="/privacy">Privacy</Link> <span aria-hidden="true">·</span>{" "}
            <Link to="/terms">Terms</Link> <span aria-hidden="true">·</span>{" "}
            <Link to="/contact">Contact</Link>
          </div>
        </footer>
      </div>

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
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
