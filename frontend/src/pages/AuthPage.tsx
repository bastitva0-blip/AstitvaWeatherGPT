import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";
import { Input } from "@devalok/shilp-sutra/ui/input";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuthStore } from "../stores/authStore";

export function AuthPage() {
  const navigate = useNavigate();
  const { login, firstRun } = useAuthStore();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    <div className="auth-page">
      <div style={{ fontSize: "2rem" }}>🌩</div>
      <h1 className="font-display">Know your sky.</h1>
      <p style={{ color: "var(--text-muted)" }}>Sign in to save locations, set alerts, and use voice.</p>
      <Card variant="elevated" style={{ width: "100%", maxWidth: 380, marginTop: "1.5rem" }}>
        <CardContent style={{ padding: "2rem" }}>
          <Button variant="outline" fullWidth style={{ marginBottom: "1rem" }} onClick={withGoogle} disabled={busy}>
            Continue with Google
          </Button>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.5rem 0", textAlign: "center" }}>— OR —</div>
          {showEmailForm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button fullWidth onClick={withEmail} disabled={busy || !email || !password}>
                Continue
              </Button>
            </div>
          ) : (
            <Button fullWidth onClick={() => setShowEmailForm(true)}>Continue with email</Button>
          )}
          {error && <p style={{ color: "var(--color-danger, #e5484d)", fontSize: "0.8rem", marginTop: "0.75rem" }}>{error}</p>}
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem" }}>Free forever. No credit card.</p>
        </CardContent>
      </Card>
    </div>
  );
}
