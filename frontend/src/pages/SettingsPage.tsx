import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageGrid } from "../components/UI/LanguageSelect";
import { useLangStore } from "../stores/langStore";
import { useChatStore } from "../stores/chatStore";
import { useCitiesStore } from "../stores/citiesStore";
import { useAlertStore } from "../stores/alertStore";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { getCachedTimestamp } from "../hooks/useOnlineStatus";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Sheet, SheetContent, SheetTitle } from "@devalok/shilp-sutra/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@devalok/shilp-sutra/ui/dialog";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { Switch } from "@devalok/shilp-sutra/ui/switch";
import { Button } from "@devalok/shilp-sutra/ui/button";

export function SettingsPage() {
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const lang = useLangStore((s) => s.lang);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const { granted, enable } = usePushNotifications();
  const [digest, setDigest] = useState(false);
  const [confirmClear, setConfirmClear] = useState<"chat" | "cities" | null>(null);
  const clearChat = useChatStore((s) => s.clear);
  const cities = useCitiesStore((s) => s.cities);
  const removeCity = useCitiesStore((s) => s.removeCity);
  const messages = useChatStore((s) => s.messages);
  const alerts = useAlertStore((s) => s.alerts);
  const lastSync = getCachedTimestamp("home");

  function exportData() {
    const blob = new Blob([JSON.stringify({ messages, cities, alerts }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sanket-data.json"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title="Settings" />

      <div className="settings-group">
        <div className="settings-group__title">Preferences</div>
        <div className="settings-cell" onClick={() => setLangOpen(true)}><span>Language</span><span>{lang}</span></div>
        <div className="settings-cell">
          <span>Temperature unit</span>
          <SegmentedControl
            size="sm"
            options={[{ id: "C", text: "°C" }, { id: "F", text: "°F" }]}
            value={unit}
            onValueChange={(id) => setUnit(id as "C" | "F")}
          />
        </div>
        <div className="settings-cell"><span>Default location</span><span>{cities[0]?.name || "Not set"}</span></div>
      </div>

      <Sheet open={langOpen} onOpenChange={setLangOpen}>
        <SheetContent side="bottom">
          <SheetTitle>Language</SheetTitle>
          <LanguageGrid onDone={() => setLangOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="settings-group">
        <div className="settings-group__title">Notifications</div>
        <div className="settings-cell">
          <span>Push alerts</span>
          <Switch checked={granted} onCheckedChange={() => !granted && enable()} />
        </div>
        <div className="settings-cell">
          <span>Daily forecast digest</span>
          <Switch checked={digest} onCheckedChange={setDigest} />
        </div>
        <div className="settings-cell"><span>SMS fallback</span><span style={{ color: "var(--text-muted)" }}>Coming soon</span></div>
      </div>

      <div className="settings-group">
        <div className="settings-group__title">Data & Privacy</div>
        <div className="settings-cell"><span>Last sync</span><span>{lastSync ? `${Math.round((Date.now() - lastSync.getTime()) / 60000)} minutes ago` : "—"}</span></div>
        <div className="settings-cell"><Button variant="ghost" color="error" onClick={() => setConfirmClear("chat")}>Clear chat history</Button></div>
        <div className="settings-cell"><Button variant="ghost" color="error" onClick={() => setConfirmClear("cities")}>Clear saved locations</Button></div>
        <div className="settings-cell"><Button variant="ghost" onClick={exportData}>Export my data</Button></div>
      </div>

      <Dialog open={!!confirmClear} onOpenChange={(o) => !o && setConfirmClear(null)}>
        <DialogContent>
          <DialogTitle>Are you sure?</DialogTitle>
          <p>This will delete {confirmClear === "chat" ? messages.length : cities.length} {confirmClear === "chat" ? "messages" : "cities"}. Cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClear(null)}>Cancel</Button>
            <Button color="error" onClick={() => {
              if (confirmClear === "chat") clearChat();
              else cities.forEach((c) => removeCity(c.name));
              setConfirmClear(null);
            }}>Confirm delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="settings-group">
        <div className="settings-group__title">Developer</div>
        <div className="settings-cell" onClick={() => navigate("/app/developer")}><span>API & MCP docs</span><span>→</span></div>
        <div className="settings-cell"><span>Rate limit</span><span>847 / 1000 req today</span></div>
      </div>

      <div className="settings-group">
        <div className="settings-group__title">About</div>
        <div className="settings-cell" onClick={() => navigate("/app/about")}><span>Coverage & sources</span><span>→</span></div>
        <div className="settings-cell" onClick={() => window.open("/team", "_blank")}><span>About the team</span><span>→</span></div>
        <div className="settings-cell" onClick={() => window.open("https://github.com/bastitva0-blip/AstitvaWeatherGPT", "_blank", "noopener,noreferrer")}><span>Open source</span><span>GitHub ↗</span></div>
        <div className="settings-cell"><span>Version</span><span>Sanket v3.0.0 · SIH26068</span></div>
        <div className="settings-cell">Built by Team Eloquence</div>
      </div>
    </div>
  );
}
