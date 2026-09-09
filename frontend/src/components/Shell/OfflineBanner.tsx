import { useTranslation } from "react-i18next";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export function OfflineBanner({ route }: { route?: string }) {
  const { t } = useTranslation();
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div style={{
      background: "var(--saffron-dim)", border: "1px solid var(--saffron)",
      borderRadius: 8, padding: "0.6rem 1rem", margin: "0.5rem",
      fontSize: "0.85rem", color: "var(--saffron)",
    }}>
      📡 {t("alerts.offline_banner")}
    </div>
  );
}
