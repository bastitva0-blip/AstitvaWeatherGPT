import { NavLink } from "react-router-dom";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Avatar, AvatarFallback } from "@devalok/shilp-sutra/ui/avatar";
import { useAuthStore } from "../../stores/authStore";

const GITHUB_URL = "https://github.com/bastitva0-blip/AstitvaWeatherGPT";
const DOCS_URL = "https://backend-production-c6aa1.up.railway.app/docs";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { userName, userEmail, logout } = useAuthStore();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar__user">
        <Avatar><AvatarFallback>{(userName || "?").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
        <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>{userName}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{userEmail}</div>
      </div>
      <div className="sidebar__section">
        {[
          ["Home", "/app"], ["Chat", "/app/chat"], ["Map", "/app/map"], ["Cities", "/app/cities"],
          ["Compare", "/app/compare"], ["Alerts", "/app/alerts"], ["History", "/app/history"],
        ].map(([label, to]) => (
          <NavLink key={to} to={to} end={to === "/app"} onClick={onClose}>{label}</NavLink>
        ))}
      </div>
      <div className="sidebar__section">
        <div className="sidebar__label">Analysis</div>
        <NavLink to="/app/climate" onClick={onClose}>Climate Trends</NavLink>
        <NavLink to="/app/about" onClick={onClose}>Coverage & Sources</NavLink>
        <a href="/team" onClick={onClose}>About the Team ↗</a>
      </div>
      <div className="sidebar__section">
        <div className="sidebar__label">Developer</div>
        <NavLink to="/app/developer" onClick={onClose}>API & MCP</NavLink>
        <a href={DOCS_URL} target="_blank" rel="noreferrer">API Docs ↗</a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
      <div className="sidebar__section">
        <div className="sidebar__label">Account</div>
        <NavLink to="/app/settings" onClick={onClose}>Settings</NavLink>
        <Button variant="ghost" color="error" fullWidth onClick={logout} style={{ justifyContent: "flex-start" }}>Sign out</Button>
      </div>
    </aside>
  );
}
