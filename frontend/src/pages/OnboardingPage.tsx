import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { IconMapPin, IconCheck } from "@tabler/icons-react";
import { LanguageGrid } from "../components/UI/LanguageSelect";
import { useAuthStore } from "../stores/authStore";
import { useCitiesStore } from "../stores/citiesStore";
import { usePushNotifications } from "../hooks/usePushNotifications";

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [city, setCity] = useState("");
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const addCity = useCitiesStore((s) => s.addCity);
  const { granted, enable } = usePushNotifications();

  function useGps() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCity(`${pos.coords.latitude.toFixed(2)},${pos.coords.longitude.toFixed(2)}`);
        addCity({ name: "Current location", lat: pos.coords.latitude, lon: pos.coords.longitude, addedAt: new Date().toISOString() });
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  function finish() {
    completeOnboarding();
    navigate("/app");
  }

  return (
    <div className="onboarding-page">
      <div className="progress-dots">{[0, 1, 2].map((i) => <span key={i} className={i === step ? "active" : ""} />)}</div>

      {step === 0 && (
        <>
          <h1 className="font-display">WeatherGPT बोलता है आपकी भाषा</h1>
          <LanguageGrid />
          <Button style={{ marginTop: "1.5rem" }} onClick={() => setStep(1)}>Continue →</Button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="font-display">Where do you need weather?</h1>
          <Button fullWidth style={{ maxWidth: 320, margin: "1rem 0" }} onClick={useGps} loading={locating} startIcon={<IconMapPin />}>
            Use my GPS location
          </Button>
          <Input placeholder="Type your city" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%", maxWidth: 320 }} />
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>You can add more cities later.</p>
          <Button style={{ marginTop: "1rem" }} onClick={() => { if (city) addCity({ name: city, lat: 0, lon: 0, addedAt: new Date().toISOString() }); setStep(2); }}>Continue →</Button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="font-display">Get alerts before they matter.</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: 380 }}>WeatherGPT can send push notifications for cyclone warnings and threshold alerts — even when the app is closed.</p>
          {granted ? (
            <p style={{ color: "var(--safe)" }}><IconCheck size={16} style={{ verticalAlign: "middle" }} /> You're all set</p>
          ) : (
            <Button onClick={enable}>Enable push notifications</Button>
          )}
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>You can enable this later in Settings</p>
          <Button style={{ marginTop: "1rem" }} onClick={finish}>Start using WeatherGPT</Button>
        </>
      )}
    </div>
  );
}
