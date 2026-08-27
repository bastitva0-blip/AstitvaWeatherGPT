import { NavLink, Route, Routes } from "react-router-dom";
import { AlertsPage } from "./pages/AlertsPage";
import { ChatPage } from "./pages/ChatPage";
import { ClimateTrendsPage } from "./pages/ClimateTrendsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <div className="app-shell">
      <main className="app-shell__content">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/climate-trends" element={<ClimateTrendsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <nav className="bottom-nav">
        <NavLink to="/">Chat</NavLink>
        <NavLink to="/alerts">Alerts</NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/climate-trends">Climate</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
    </div>
  );
}
