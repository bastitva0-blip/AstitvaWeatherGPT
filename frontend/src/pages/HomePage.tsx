import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WeatherHeroCard } from "../components/Weather/WeatherHeroCard";
import { StatGrid } from "../components/Weather/StatGrid";
import { AQICard } from "../components/Weather/AQICard";
import { CycloneFullscreen } from "../components/Weather/CycloneFullscreen";
import { FloodBanner } from "../components/Weather/FloodBanner";
import { OfflineBanner } from "../components/Shell/OfflineBanner";
import { fetchLiveWeather, fetchAqi, type WeatherData, type AqiResponse } from "../lib/api";
import { useCitiesStore } from "../stores/citiesStore";
import { cacheTimestamp } from "../hooks/useOnlineStatus";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Skeleton } from "@devalok/shilp-sutra/ui/skeleton";
import { EmptyState } from "@devalok/shilp-sutra/composed/empty-state";
import { IconMessage, IconBellPlus, IconScale, IconMap } from "@tabler/icons-react";

export function HomePage() {
  const navigate = useNavigate();
  const activeCity = useCitiesStore((s) => s.activeCity);
  const savedCities = useCitiesStore((s) => s.cities);
  const [data, setData] = useState<WeatherData | null>(null);
  const [aqi, setAqi] = useState<AqiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [cycloneDismissed, setCycloneDismissed] = useState(false);
  const cityName = activeCity?.name || savedCities[0]?.name || "Delhi";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLiveWeather(cityName)
      .catch(() => (cityName !== "Delhi" ? fetchLiveWeather("Delhi") : Promise.reject()))
      .then((d) => {
        if (cancelled) return;
        setData(d);
        cacheTimestamp("home");
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    fetchAqi(cityName).then((a) => !cancelled && setAqi(a)).catch(() => !cancelled && setAqi(null));
    return () => { cancelled = true; };
  }, [cityName]);

  const alertId = data?.cyclone_name || "cyclone";
  const showCyclone =
    data?.cyclone_warning &&
    !cycloneDismissed &&
    sessionStorage.getItem(`cyclone_dismissed_${alertId}`) !== "true";

  if (loading) {
    return (
      <div style={{ padding: "1rem" }}>
        <Skeleton style={{ height: 220, marginBottom: "0.75rem" }} />
        <Skeleton style={{ height: 100, marginBottom: "0.75rem" }} />
        <Skeleton style={{ height: 100 }} />
      </div>
    );
  }

  if (failed || !data) {
    return (
      <EmptyState
        title="Weather data unavailable"
        action={<Button onClick={() => window.location.reload()}>Tap to refresh</Button>}
      />
    );
  }

  return (
    <div>
      <OfflineBanner route="home" />
      {showCyclone && (
        <CycloneFullscreen
          alertId={alertId}
          cycloneName={data.cyclone_name || "Unnamed"}
          distanceKm={340}
          severity="Orange"
          isFisherman={false}
          onDismiss={() => setCycloneDismissed(true)}
        />
      )}
      {data.flood_warning && !showCyclone && (
        <FloodBanner location={cityName} floodName={data.flood_name || "Flood event"} alertId={data.flood_name || "flood"} />
      )}

      <WeatherHeroCard data={data} cityLabel={cityName} usingGps={!!activeCity} />

      <div style={{ padding: "0.75rem" }}>
        <StatGrid data={data} />
        <div style={{ marginTop: "0.75rem" }}>
          <AQICard aqi={aqi} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", padding: "1rem 0.75rem", flexWrap: "wrap" }}>
        <Button variant="outline" startIcon={<IconMessage />} onClick={() => navigate("/app/chat")}>Ask AI</Button>
        <Button variant="outline" startIcon={<IconBellPlus />} onClick={() => navigate("/app/alerts")}>Set Alert</Button>
        <Button variant="outline" startIcon={<IconScale />} onClick={() => navigate("/app/compare")}>Compare Cities</Button>
        <Button variant="outline" startIcon={<IconMap />} onClick={() => navigate("/app/map")}>View Map</Button>
      </div>
    </div>
  );
}
