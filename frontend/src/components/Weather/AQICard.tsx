import { useTranslation } from "react-i18next";
import type { AqiResponse } from "../../lib/api";

const AQI_BANDS = [
  { max: 50,  label: "Good",        color: "#00D4AA" },
  { max: 100, label: "Satisfactory",color: "#90EE90" },
  { max: 200, label: "Moderate",    color: "#FF9500" },
  { max: 300, label: "Poor",        color: "#FF6B35" },
  { max: 400, label: "Very Poor",   color: "#FF4444" },
  { max: 500, label: "Severe",      color: "#8B0000" },
];

function aqiBand(aqi: number) {
  return AQI_BANDS.find((b) => aqi <= b.max) ?? AQI_BANDS[AQI_BANDS.length - 1];
}

export function AQICard({ aqi }: { aqi: AqiResponse | null }) {
  const { t } = useTranslation();
  if (!aqi) return (
    <div className="aqi-card aqi-card--empty">
      <p>{t("weather.aqi_unavailable")}</p>
    </div>
  );

  const band = aqiBand(aqi.aqi_index);
  const pct  = Math.min((aqi.aqi_index / 500) * 100, 100);
  const pollutants = [
    { label: "PM2.5", value: aqi.pm2_5 },
    { label: "PM10",  value: aqi.pm10  },
    { label: "CO",    value: aqi.co    },
    { label: "NO₂",   value: aqi.no2   },
    { label: "O₃",    value: aqi.o3    },
  ].filter((p) => p.value != null);

  return (
    <div className="aqi-card">
      <div className="aqi-card__header">
        <span className="aqi-card__label">AQI</span>
        <span className="aqi-card__value mono" style={{ color: band.color }}>{aqi.aqi_index}</span>
        <span className="aqi-card__band" style={{ color: band.color }}>{band.label}</span>
      </div>
      <div className="aqi-bar">
        <div className="aqi-bar__fill" style={{ width: `${pct}%`, background: band.color }} />
      </div>
      <div className="aqi-card__pollutants">
        {pollutants.map((p) => (
          <div key={p.label} className="aqi-pollutant">
            <span className="aqi-pollutant__label">{p.label}</span>
            <span className="aqi-pollutant__value mono">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
