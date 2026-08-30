import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@devalok/shilp-sutra/ui/sheet";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Skeleton } from "@devalok/shilp-sutra/ui/skeleton";
import { useCitiesStore } from "../../stores/citiesStore";

export interface PopupData {
  name: string; lat: number; lon: number; temp: number; condition: string;
  humidity?: number; wind_speed_kmh?: number; wind_direction_deg?: number;
  aqi_index?: number; aqi_label?: string; advisory?: string;
}

// CHANGE 4: Reverse-geocode lat/lon → human-readable place name.
// Raw coords "21.25, 78.58" replaced with "Nagpur Region, MH" style labels.
async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { "Accept-Language": "en" } }
    );
    const j = await r.json();
    // Build "City, State" or "District, State" — avoid full verbose address
    const a = j.address || {};
    const city = a.city || a.town || a.village || a.county || a.district || "";
    const state = a.state ? a.state.replace(" State", "").replace("Jammu and Kashmir", "J&K") : "";
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (j.display_name) return j.display_name.split(",").slice(0, 2).join(", ");
    return null;
  } catch {
    return null;
  }
}

export function WeatherPopup({ data, onClose }: { data: PopupData; onClose: () => void }) {
  const addCity = useCitiesStore((s) => s.addCity);
  const setActiveCity = useCitiesStore((s) => s.setActiveCity);
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() =>
    useCitiesStore.getState().cities.some((c) => c.name === data.name)
  );
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // Only reverse-geocode if the name looks like raw coords
  const looksLikeCoords = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(data.name.trim());

  useEffect(() => {
    if (!looksLikeCoords) return;
    setGeocoding(true);
    reverseGeocode(data.lat, data.lon)
      .then((name) => setPlaceName(name))
      .finally(() => setGeocoding(false));
  }, [data.lat, data.lon, looksLikeCoords]);

  const displayName = looksLikeCoords
    ? geocoding
      ? null // show skeleton
      : placeName || data.name
    : data.name;

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {displayName ? (
              <SheetTitle style={{ fontSize: "1.1rem" }}>{displayName}</SheetTitle>
            ) : (
              <Skeleton style={{ width: "60%", height: 22, borderRadius: 6 }} />
            )}
          </div>
          <span
            className="mono"
            style={{ fontSize: "1.4rem", fontWeight: 700, flexShrink: 0, marginLeft: "0.75rem" }}
          >
            {Math.round(data.temp)}°C
          </span>
        </div>

        <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          {data.condition}
          {data.humidity != null && ` · Humidity ${data.humidity}%`}
        </p>
        {data.wind_speed_kmh != null && (
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Wind: {data.wind_speed_kmh} km/h
            {data.aqi_index != null && ` · AQI: ${data.aqi_index} ${data.aqi_label ?? ""}`}
          </p>
        )}
        {data.advisory && (
          <div style={{ marginTop: "0.5rem" }}>
            <Badge color="warning" variant="soft">⚠ {data.advisory}</Badge>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
          <Button
            onClick={() => {
              setActiveCity({ name: displayName || data.name, lat: data.lat, lon: data.lon, addedAt: new Date().toISOString() });
              navigate("/app");
            }}
          >
            Full details
          </Button>
          <Button
            variant="outline"
            disabled={saved}
            onClick={() => {
              addCity({ name: displayName || data.name, lat: data.lat, lon: data.lon, addedAt: new Date().toISOString() });
              setSaved(true);
            }}
          >
            {saved ? "Saved ✓" : "Save to Cities +"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
