import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";
import { IconMapPin, IconCheck, IconMapPinFilled } from "@tabler/icons-react";
import { LanguageGrid } from "../components/UI/LanguageSelect";
import { useAuthStore } from "../stores/authStore";
import { useCitiesStore } from "../stores/citiesStore";
import { usePushNotifications } from "../hooks/usePushNotifications";

export function OnboardingPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [city, setCity] = useState("");
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const addCity = useCitiesStore((s) => s.addCity);
  const { granted, enable } = usePushNotifications();

  const [gpsResolved, setGpsResolved] = useState(false);

  function useGps() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          const name = data.address?.city || data.address?.town || data.address?.village
            || data.address?.state_district || data.address?.state || `${lat.toFixed(2)},${lon.toFixed(2)}`;
          setCity(name);
          addCity({ name, lat, lon, addedAt: new Date().toISOString() });
          setGpsResolved(true);
        } catch {
          // reverse geocode failed, leave city blank so the user types it manually
        } finally {
          setLocating(false);
        }
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
          <h1 className="font-display">{t("onboarding.lang_title")}</h1>
          <LanguageGrid />
          <Button style={{ marginTop: "1.5rem" }} onClick={() => setStep(1)}>{t("onboarding.continue")}</Button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="font-display">{t("onboarding.location_title")}</h1>
          <Button fullWidth style={{ maxWidth: 320, margin: "1rem 0" }} onClick={useGps} loading={locating} startIcon={<IconMapPin />}>
            {t("onboarding.gps_button")}
          </Button>
          <Input
            placeholder={t("onboarding.city_placeholder")}
            value={city}
            onChange={(e) => { setCity(e.target.value); setGpsResolved(false); }}
            style={{ width: "100%", maxWidth: 320 }}
          />
          {city && (
            <Card variant="outline" color={gpsResolved ? "success" : "accent"} style={{ width: "100%", maxWidth: 320, marginTop: "0.75rem" }}>
              <CardContent style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem" }}>
                <IconMapPinFilled size={18} style={{ flexShrink: 0, color: "var(--teal)" }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{t("onboarding.city_selected")}</div>
                  <div className="font-display" style={{ fontSize: "1rem" }}>{city}</div>
                </div>
              </CardContent>
            </Card>
          )}
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>{t("onboarding.city_hint")}</p>
          <Button
            style={{ marginTop: "1rem" }}
            disabled={!city}
            onClick={() => { if (city && !gpsResolved) addCity({ name: city, lat: 0, lon: 0, addedAt: new Date().toISOString() }); setStep(2); }}
          >
            {t("onboarding.continue")}
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="font-display">{t("onboarding.notif_title")}</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: 380 }}>{t("onboarding.notif_body")}</p>
          {granted ? (
            <p style={{ color: "var(--safe)" }}><IconCheck size={16} style={{ verticalAlign: "middle" }} /> {t("onboarding.notif_ready")}</p>
          ) : (
            <Button onClick={enable}>{t("onboarding.notif_enable")}</Button>
          )}
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t("onboarding.notif_later")}</p>
          <Button style={{ marginTop: "1rem" }} onClick={finish}>{t("onboarding.start")}</Button>
        </>
      )}
    </div>
  );
}
