import { useNavigate } from "react-router-dom";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";
import { useAuthStore } from "../stores/authStore";

export function AuthPage() {
  const navigate = useNavigate();
  const { login, firstRun } = useAuthStore();

  function complete() {
    login("Astitva", "astitva.bhardwaj@devalok.in");
    navigate(firstRun ? "/onboarding" : "/app");
  }

  return (
    <div className="auth-page">
      <div style={{ fontSize: "2rem" }}>🌩</div>
      <h1 className="font-display">Know your sky.</h1>
      <p style={{ color: "var(--text-muted)" }}>Sign in to save locations, set alerts, and use voice.</p>
      <Card variant="elevated" style={{ width: "100%", maxWidth: 380, marginTop: "1.5rem" }}>
        <CardContent style={{ padding: "2rem" }}>
          <Button variant="outline" fullWidth style={{ marginBottom: "1rem" }} onClick={complete}>
            Continue with Google
          </Button>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "0.5rem 0", textAlign: "center" }}>— OR —</div>
          <Button fullWidth onClick={complete}>Continue with email</Button>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem" }}>Free forever. No credit card.</p>
        </CardContent>
      </Card>
    </div>
  );
}
