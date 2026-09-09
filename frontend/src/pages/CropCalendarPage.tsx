import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Skeleton } from "@devalok/shilp-sutra/ui/skeleton";
import { fetchCropCalendar, type CropCalendar, type CropMonth } from "../lib/api";

const CROPS = ["wheat","rice","cotton","maize","sugarcane","mustard","soybean","groundnut"];

const PHASE_COLOR: Record<string, string> = {
  sow:"rgba(0,212,170,0.15)",growing:"rgba(34,153,68,0.15)",harvest:"rgba(255,149,0,0.15)",rest:"rgba(74,107,130,0.10)",
};
const PHASE_BORDER: Record<string, string> = {
  sow:"var(--teal)",growing:"#229944",harvest:"var(--saffron)",rest:"var(--border)",
};

function MonthCard({ m, isCurrent }: { m: CropMonth; isCurrent: boolean }) {
  const { t } = useTranslation();
  return (
    <div style={{
      background: isCurrent ? "var(--teal-glow)" : PHASE_COLOR[m.phase],
      border: `1.5px solid ${isCurrent ? "var(--teal)" : PHASE_BORDER[m.phase]}`,
      borderRadius: 10, padding: "0.7rem 0.6rem", position: "relative",
    }}>
      {isCurrent && (
        <span style={{ position:"absolute", top:5, right:7, fontSize:"0.6rem", color:"var(--teal)", fontWeight:700, letterSpacing:1 }}>
          NOW
        </span>
      )}
      <p style={{ margin:0, fontSize:"0.75rem", fontWeight:700, color:"var(--text-muted)" }}>{m.month_name}</p>
      <p style={{ margin:"0.3rem 0", fontSize:"1.4rem", lineHeight:1 }}>{m.phase_emoji}</p>
      <p style={{ margin:0, fontSize:"0.7rem", fontWeight:600, color:"var(--text-primary)", textTransform:"capitalize" }}>
        {t(`crop.${m.phase}`)}
      </p>
      <p style={{ margin:"0.3rem 0 0", fontSize:"0.65rem", color:"var(--text-muted)", lineHeight:1.4 }}>{m.action}</p>
      <p style={{ margin:"0.4rem 0 0", fontSize:"0.75rem" }}>{m.water_emoji}</p>
    </div>
  );
}

export function CropCalendarPage() {
  const { t } = useTranslation();
  const [crop, setCrop]       = useState("wheat");
  const [cal, setCal]         = useState<CropCalendar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCropCalendar(crop).then(setCal).catch(() => setCal(null)).finally(() => setLoading(false));
  }, [crop]);

  const phaseLabel = cal ? t(`crop.${cal.current_phase}`) : "";

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title={`🌾 ${t("crop.title")}`} subtitle={t("crop.subtitle")} />

      <div style={{ margin: "1rem 0", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {CROPS.map((c) => (
          <button key={c} onClick={() => setCrop(c)} style={{
            padding: "0.4rem 0.9rem", borderRadius: 20, cursor: "pointer",
            fontSize: "0.85rem", fontWeight: 600, textTransform: "capitalize",
            background: crop === c ? "var(--teal)" : "var(--bg-elevated)",
            color: crop === c ? "#020B14" : "var(--text-muted)",
            border: `1px solid ${crop === c ? "var(--teal)" : "var(--border)"}`,
          }}>{c}</button>
        ))}
      </div>

      {cal && (
        <div style={{ background:"var(--teal-glow)", border:"1px solid var(--teal)", borderRadius:10, padding:"0.75rem 1rem", marginBottom:"1rem" }}>
          <p style={{ margin:0, fontSize:"0.75rem", color:"var(--teal)", fontWeight:700, letterSpacing:1 }}>
            {t("crop.this_month", { phase: phaseLabel.toUpperCase() })}
          </p>
          <p style={{ margin:"0.3rem 0 0", fontSize:"0.95rem", color:"var(--text-primary)" }}>{cal.current_action}</p>
          <p style={{ margin:"0.2rem 0 0", fontSize:"0.75rem", color:"var(--text-muted)" }}>
            {t("crop.source_label")}: {cal.source}
          </p>
        </div>
      )}

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"0.5rem" }}>
          {[...Array(12)].map((_, i) => <Skeleton key={i} style={{ height:130, borderRadius:10 }} />)}
        </div>
      ) : cal ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"0.5rem" }}>
          {cal.months.map((m) => <MonthCard key={m.month} m={m} isCurrent={m.is_current} />)}
        </div>
      ) : (
        <p style={{ color:"var(--text-muted)" }}>{t("crop.unavailable")}</p>
      )}

      <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginTop:"1rem", padding:"0.75rem", background:"var(--bg-elevated)", borderRadius:10 }}>
        {[
          { emoji:"🌱", key:"sow" }, { emoji:"🌿", key:"growing" },
          { emoji:"🌾", key:"harvest" }, { emoji:"💤", key:"rest" },
          { emoji:"💧❌", key:"no_water" }, { emoji:"💧💧💧", key:"high_water" },
        ].map((l) => (
          <div key={l.key} style={{ display:"flex", gap:"0.3rem", alignItems:"center", fontSize:"0.75rem", color:"var(--text-muted)" }}>
            <span>{l.emoji}</span><span>{t(`crop.${l.key}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
