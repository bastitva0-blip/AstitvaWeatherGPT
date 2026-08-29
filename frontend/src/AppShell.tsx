import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./components/Shell/TopBar";
import { BottomNav } from "./components/Shell/BottomNav";

const TITLES: Record<string, string> = {
  "/app": "WeatherGPT", "/app/chat": "Chat", "/app/map": "Map", "/app/cities": "Cities",
  "/app/compare": "Compare", "/app/alerts": "Alerts", "/app/history": "History",
  "/app/climate": "Climate Trends", "/app/settings": "Settings", "/app/developer": "Developer",
  "/app/admin": "Admin", "/app/about": "About",
};

export function AppShell() {
  const { pathname } = useLocation();
  const isMap = pathname === "/app/map";
  return (
    <div className="app-shell">
      <TopBar title={TITLES[pathname] || "WeatherGPT"} transparent={isMap} />
      <main className="app-shell__content" style={isMap ? { maxWidth: "none", padding: 0 } : undefined}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
