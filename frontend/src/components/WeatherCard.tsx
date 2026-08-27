import type { QueryResponse } from "../lib/api";

export function WeatherCard({ response }: { response: QueryResponse }) {
  const s = response.weather_summary;
  const isFisherman = response.use_case_context === "fisherman";

  return (
    <div className="weather-card">
      <div className="weather-card__header">
        <span>{s.location}</span>
        {s.nwp_model && <span className="badge badge--nwp">{s.nwp_model}</span>}
        {response.alert_level !== "none" && (
          <span className={`badge badge--alert-${response.alert_level}`}>{response.alert_level}</span>
        )}
      </div>
      <p className="weather-card__answer">{response.answer}</p>
      <div className="weather-card__grid">
        {s.rainfall_mm != null && <span>Rainfall: {s.rainfall_mm}mm</span>}
        {s.condition && <span>Condition: {s.condition}</span>}
        {s.wave_height_m != null && <span>Wave height: {s.wave_height_m}m</span>}
        {s.coastal_zone && <span>Zone: {s.coastal_zone}</span>}
      </div>
      {isFisherman && s.fishing_zone_safe != null && (
        <div
          className="sea-safety-badge"
          style={{ background: s.fishing_zone_safe ? "#16A34A" : "#DC2626" }}
        >
          {s.fishing_zone_safe ? "SAFE to go to sea" : "UNSAFE — do not go to sea"}
        </div>
      )}
      <div className="weather-card__citations">
        {response.citations.map((c, i) => (
          <a key={i} href={c.url || "#"} target="_blank" rel="noreferrer">
            {c.source}
          </a>
        ))}
      </div>
    </div>
  );
}
