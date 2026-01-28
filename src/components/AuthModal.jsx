import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function AuthModal({ mode, onClose, upgradeMessage }) {
  const isSignup = mode === "signup";
  const isForgotPassword = mode === "forgot-password";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showLogin, setShowLogin] = useState(!isForgotPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (!showLogin) {
        // Forgot password flow
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMessage("Password reset link sent! Check your email.");
      } else if (isSignup) {
        // Validate passwords match
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        
        // Validate password length
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          // Handle specific error cases
          if (error.message.includes("already registered") || error.message.includes("already exists")) {
            setError("This email is already registered. Please log in instead.");
          } else if (error.message.includes("invalid email")) {
            setError("Please enter a valid email address.");
          } else if (error.message.includes("password")) {
            setError("Password does not meet requirements. Must be at least 6 characters.");
          } else {
            setError(error.message);
          }
          setLoading(false);
          return;
        }
        setSuccessMessage("Account created! Please check your email to verify your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          // Handle specific login errors
          if (error.message.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please try again.");
          } else if (error.message.includes("Email not confirmed")) {
            setError("Please verify your email before logging in. Check your inbox.");
          } else {
            setError(error.message);
          }
          setLoading(false);
          return;
        }
        onClose();
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>
          {!showLogin
            ? "Reset your password"
            : isSignup
            ? "Create your account"
            : "Log in"}
        </h2>

        {/* Show signup benefits under the heading */}
        {isSignup && showLogin && (
          <p className="modal-upgrade">
            Sign up to unlock daily streak tracking and unlimited practice mode
          </p>
        )}
        {/* Message shown when practice mode forces signup */}
        {upgradeMessage && <p className="modal-upgrade">{upgradeMessage}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {showLogin && (
            <>
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              {isSignup && (
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}
            </>
          )}

          {error && <p className="modal-error">{error}</p>}
          {successMessage && <p className="modal-success">{successMessage}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : !showLogin
              ? "Send reset link"
              : isSignup
              ? "Sign up"
              : "Log in"}
          </button>

          {!isSignup && showLogin && (
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => {
                setShowLogin(false);
                setError("");
                setPassword("");
                setConfirmPassword("");
              }}
            >
              Forgot password?
            </button>
          )}

          {!showLogin && (
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => {
                setShowLogin(true);
                setError("");
                setSuccessMessage("");
                setConfirmPassword("");
              }}
            >
              Back to login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
