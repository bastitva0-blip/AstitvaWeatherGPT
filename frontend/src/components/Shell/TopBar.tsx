import { useState } from "react";
import { TopBar as SutraTopBar } from "@devalok/shilp-sutra/shell/top-bar";
import { IconMenu2, IconBell, IconSearch } from "@tabler/icons-react";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { LanguageSelect } from "../UI/LanguageSelect";
import { useAlertStore } from "../../stores/alertStore";
import { Sidebar } from "./Sidebar";
import { GlobalSearch } from "../UI/GlobalSearch";

function wis2Status(lastAt: Date | null): "live" | "delayed" | "offline" {
  if (!lastAt) return "offline";
  const mins = (Date.now() - lastAt.getTime()) / 60000;
  if (mins < 5) return "live";
  if (mins < 30) return "delayed";
  return "offline";
}

export function TopBar({ title, transparent }: { title: string; transparent?: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const alerts = useAlertStore((s) => s.alerts);
  const lastWIS2 = useAlertStore((s) => s.lastWIS2MessageAt);
  const status = wis2Status(lastWIS2);

  return (
    <>
      <SutraTopBar className={transparent ? "!bg-transparent !border-0 !absolute !text-white" : undefined}>
        <SutraTopBar.Left>
          <IconButton icon={<IconMenu2 />} variant="ghost" aria-label="Open menu" onClick={() => setSidebarOpen(true)} />
        </SutraTopBar.Left>
        <SutraTopBar.Center>
          <SutraTopBar.Title>{title}</SutraTopBar.Title>
        </SutraTopBar.Center>
        <SutraTopBar.Right>
          <SutraTopBar.Section gap="tight">
            {/* CHANGE 1 + 3: Language switcher is top-level; Search icon opens global search */}
            <LanguageSelect />
            <IconButton
              icon={<IconSearch />}
              variant="ghost"
              aria-label="Search location"
              onClick={() => setSearchOpen(true)}
            />
            <span title={`WIS2.0 ${status}`} className={`wis2-dot wis2-dot--${status}`} />
            <div style={{ position: "relative" }}>
              <IconButton icon={<IconBell />} variant="ghost" aria-label="Notifications" />
              {alerts.length > 0 && (
                <Badge color="error" size="xs" style={{ position: "absolute", top: -4, right: -4 }}>
                  {alerts.length}
                </Badge>
              )}
            </div>
          </SutraTopBar.Section>
        </SutraTopBar.Right>
      </SutraTopBar>

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar open onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* CHANGE 1: Global search sheet */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
