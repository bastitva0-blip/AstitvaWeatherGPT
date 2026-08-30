import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TopBar } from "./components/Shell/TopBar";
import { BottomNav } from "./components/Shell/BottomNav";

const TITLE_KEYS: Record<string, string> = {
  "/app/chat": "nav.chat", "/app/map": "nav.map", "/app/cities": "nav.cities",
  "/app/compare": "nav.compare", "/app/alerts": "nav.alerts", "/app/history": "nav.history",
  "/app/climate": "nav.climate", "/app/settings": "nav.settings", "/app/developer": "nav.developer",
  "/app/admin": "nav.admin", "/app/about": "nav.about",
};

export function AppShell() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isMap = pathname === "/app/map";
  const titleKey = TITLE_KEYS[pathname];
  return (
    <div className="app-shell">
      <TopBar title={titleKey ? t(titleKey) : "Sanket"} transparent={isMap} />
      <main className="app-shell__content" style={isMap ? { maxWidth: "none", padding: 0 } : undefined}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
