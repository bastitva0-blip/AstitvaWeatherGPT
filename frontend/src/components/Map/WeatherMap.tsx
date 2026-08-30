import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CoastalZones } from "./CoastalZones";
import { LayerToggle, type MapLayer } from "./LayerToggle";
import { TimelineScrubber } from "./TimelineScrubber";
import { WeatherPopup, type PopupData } from "./WeatherPopup";
import { fetchLiveWeather, fetchAqi } from "../../lib/api";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { IconSearch, IconX } from "@tabler/icons-react";

const CARTO_TOKEN = import.meta.env.VITE_CARTO_TOKEN;
const TILE_URL = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${CARTO_TOKEN ? `?key=${CARTO_TOKEN}` : ""}`;

function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export function WeatherMap() {
  const [layer, setLayer] = useState<MapLayer>("none");
  const [search, setSearch] = useState("");
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [tileError, setTileError] = useState(false);

  async function loadWeatherAt(name: string, lat: number, lon: number) {
    try {
      const w = await fetchLiveWeather(name);
      let aqi = null;
      try { aqi = await fetchAqi(name); } catch { /* optional */ }
      setPopup({
        name, lat, lon,
        temp: Math.round((w.temperature_max + w.temperature_min) / 2),
        condition: w.condition, humidity: w.humidity_percent,
        wind_speed_kmh: w.wind_speed_kmh,
        aqi_index: aqi?.aqi_index, aqi_label: aqi?.aqi_label,
      });
    } catch {
      setPopup({ name, lat, lon, temp: NaN, condition: "unavailable" });
    }
  }

  if (tileError) {
    return <div className="map-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-deep)" }}>
      <p style={{ color: "var(--text-muted)" }}>Map unavailable — check connection</p>
    </div>;
  }

  return (
    <div className="map-page">
      <div className="map-search">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search city or district..."
          onKeyDown={(e) => { if (e.key === "Enter" && search.trim()) loadWeatherAt(search.trim(), 20.5, 78.9); }}
          startSection={<IconSearch />}
          wrapperClassName="flex-1"
        />
        {search && <IconButton icon={<IconX />} variant="ghost" aria-label="Clear" onClick={() => setSearch("")} />}
      </div>
      <MapContainer center={[20.5, 78.9]} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer url={TILE_URL} eventHandlers={{ tileerror: () => setTileError(true) }} attribution="CartoDB Dark Matter" />
        {layer === "coastal" && <CoastalZones />}
        <ClickHandler onPick={(lat, lon) => loadWeatherAt(`${lat.toFixed(2)},${lon.toFixed(2)}`, lat, lon)} />
      </MapContainer>
      <LayerToggle active={layer} onChange={setLayer} />
      {(layer === "rain" || layer === "cloud") && <TimelineScrubber />}
      {popup && <WeatherPopup data={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}
