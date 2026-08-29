import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

const ZONE_COLORS: Record<string, string> = { safe: "#00D4AA", unsafe: "#FF4444", watch: "#FF9500" };

export function CoastalZones() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/data/indian_coastal_zones.geojson")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return null;

  return (
    <GeoJSON
      data={data}
      style={(feature) => ({ color: ZONE_COLORS[feature?.properties?.safety] || "#64748B", weight: 1, fillOpacity: 0.25 })}
      onEachFeature={(feature, layer) => {
        const p = feature.properties || {};
        layer.bindPopup(`<strong>${p.name || "Zone"}</strong><br/>${p.safety || ""}<br/>${p.incois_advisory || ""}`);
      }}
    />
  );
}
