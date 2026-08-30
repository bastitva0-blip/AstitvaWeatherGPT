import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconBrandGoogle, IconMail, IconLock, IconArrowRight, IconAlertCircle } from "@tabler/icons-react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuthStore } from "../stores/authStore";

export function AuthPage() {
  useTranslation();
  const navigate = useNavigate();
  const { login, firstRun } = useAuthStore();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  const headlines = [
    { top: "For the farmer", bottom: "in Ludhiana." },
    { top: "For the fisherman", bottom: "off Kochi coast." },
    { top: "For the pilot", bottom: "at VIDP." },
    { top: "For 1.4 billion", bottom: "people." },
  ];

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % headlines.length), 3000);
    return () => clearInterval(id);
  }, []);

  function goNext() {
    navigate(firstRun ? "/onboarding" : "/app");
  }

  async function withGoogle() {
    setError(null);
    setBusy(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      login(cred.user.displayName ?? cred.user.email ?? "User", cred.user.email ?? "");
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function withEmail() {
    setError(null);
    setBusy(true);
    try {
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
          cred = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw err;
        }
      }
      login(cred.user.email ?? "User", cred.user.email ?? "");
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-radar" aria-hidden="true">
          <div className="auth-radar__ring auth-radar__ring--outer" />
          <div className="auth-radar__ring auth-radar__ring--inner" />
          <div className="auth-radar__sweep" />
        </div>

        <div className="auth-logo">
          <div className="auth-logo__icon" aria-label="Sanket">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 3C14 3 6 8 6 16C6 20.4183 9.58172 24 14 24C18.4183 24 22 20.4183 22 16C22 8 14 3 14 3Z" fill="var(--teal)" opacity="0.9"/>
              <path d="M10 18L14 12L18 18" stroke="#020B14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="12" r="2" fill="#020B14"/>
            </svg>
          </div>
          <span className="auth-logo__name">Sanket</span>
        </div>

        <div className="auth-headline" aria-live="polite">
          <div className="auth-headline__top" key={tick + "-top"}>
            {headlines[tick].top}
          </div>
          <div className="auth-headline__bottom" key={tick + "-bot"}>
            {headlines[tick].bottom}
          </div>
        </div>

        <div className="auth-sources" aria-label="Data sources">
          {["IMD", "INCOIS", "GDACS", "OWM", "GFS"].map((s) => (
            <span key={s} className="auth-source-pill">{s}</span>
          ))}
        </div>

        <p className="auth-tagline">
          17 languages · Real-time alerts · SIH 2026
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Get started</h2>
            <p className="auth-form-sub">
              Save locations, set alerts, use voice in your language.
            </p>
          </div>

          <div className="auth-form-body">
            <button
              className="auth-google-btn"
              onClick={withGoogle}
              disabled={busy}
              aria-label="Continue with Google"
            >
              <IconBrandGoogle size={18} aria-hidden="true" />
              <span>Continue with Google</span>
            </button>

            <div className="auth-divider" aria-hidden="true">
              <span>or</span>
            </div>

            {!showEmailForm ? (
              <button
                className="auth-email-btn"
                onClick={() => setShowEmailForm(true)}
                aria-label="Continue with email"
              >
                <IconMail size={18} aria-hidden="true" />
                <span>Continue with email</span>
              </button>
            ) : (
              <div className="auth-email-form">
                <div className="auth-input-wrap">
                  <IconMail size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    aria-label="Email address"
                  />
                </div>
                <div className="auth-input-wrap">
                  <IconLock size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    aria-label="Password"
                  />
                </div>
                <button
                  className="auth-submit-btn"
                  onClick={withEmail}
                  disabled={busy || !email || !password}
                  aria-label="Continue"
                >
                  {busy ? (
                    <span className="auth-spinner" aria-label="Signing in" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <IconArrowRight size={16} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="auth-error" role="alert">
                <IconAlertCircle size={14} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <p className="auth-fine-print">
            Free forever · No credit card · Open source
          </p>
        </div>
      </div>
    </div>
  );
}
