import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./AppShell";
import { GlobalRadar } from "./components/GlobalRadar";
import { useAuthStore } from "./stores/authStore";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { HomePage } from "./pages/HomePage";
import { ChatPage } from "./pages/ChatPage";
import { MapPage } from "./pages/MapPage";
import { CitiesPage } from "./pages/CitiesPage";
import { ComparePage } from "./pages/ComparePage";
import { AlertsPage } from "./pages/AlertsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ClimateTrendsPage } from "./pages/ClimateTrendsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DeveloperPage } from "./pages/DeveloperPage";
import { AdminPage } from "./pages/AdminPage";
import { AboutPage } from "./pages/AboutPage";
import { TeamPage } from "./pages/TeamPage";

function Protected({ children }: { children: ReactNode }) {
  const authed = useAuthStore((s) => s.authed);
  if (!authed) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const authed = useAuthStore((s) => s.authed);

  return (
    <>
      <GlobalRadar />
      <Routes>
      <Route path="/" element={authed ? <Navigate to="/app" replace /> : <LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />

      <Route path="/app" element={<Protected><AppShell /></Protected>}>
        <Route index element={<HomePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="cities" element={<CitiesPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="climate" element={<ClimateTrendsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="developer" element={<DeveloperPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
