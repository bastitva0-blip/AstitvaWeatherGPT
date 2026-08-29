import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@devalok/shilp-sutra/ui/sheet";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { useCitiesStore } from "../../stores/citiesStore";

export interface PopupData {
  name: string; lat: number; lon: number; temp: number; condition: string;
  humidity?: number; wind_speed_kmh?: number; wind_direction_deg?: number;
  aqi_index?: number; aqi_label?: string; advisory?: string;
}

export function WeatherPopup({ data, onClose }: { data: PopupData; onClose: () => void }) {
  const addCity = useCitiesStore((s) => s.addCity);
  const setActiveCity = useCitiesStore((s) => s.setActiveCity);
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => useCitiesStore.getState().cities.some((c) => c.name === data.name));

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <SheetTitle>{data.name}</SheetTitle>
          <span className="mono">{Math.round(data.temp)}°C</span>
        </div>
        <p style={{ margin: "0.25rem 0" }}>
          {data.condition}{data.humidity != null && ` · Humidity ${data.humidity}%`}
        </p>
        {data.wind_speed_kmh != null && <p style={{ margin: "0.25rem 0" }}>Wind: {data.wind_speed_kmh} km/h · AQI: {data.aqi_index ?? "—"} {data.aqi_label ?? ""}</p>}
        {data.advisory && <Badge color="warning" variant="soft">⚠ {data.advisory}</Badge>}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <Button
            onClick={() => { setActiveCity({ name: data.name, lat: data.lat, lon: data.lon, addedAt: new Date().toISOString() }); navigate("/app"); }}
          >
            Full details
          </Button>
          <Button
            variant="outline"
            disabled={saved}
            onClick={() => { addCity({ name: data.name, lat: data.lat, lon: data.lon, addedAt: new Date().toISOString() }); setSaved(true); }}
          >
            {saved ? "Saved ✓" : "Save to Cities +"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
