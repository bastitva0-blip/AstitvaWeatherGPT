import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BottomNavbar } from "@devalok/shilp-sutra/shell/bottom-navbar";
import { IconHome, IconMessage, IconMap, IconMapPin, IconSettings } from "@tabler/icons-react";
import { useAlertStore } from "../../stores/alertStore";

const ITEM_DEFS = [
  { key: "nav.home", href: "/app", icon: <IconHome />, exact: true },
  { key: "nav.chat", href: "/app/chat", icon: <IconMessage /> },
  { key: "nav.map", href: "/app/map", icon: <IconMap /> },
  { key: "nav.cities", href: "/app/cities", icon: <IconMapPin /> },
  { key: "nav.settings", href: "/app/settings", icon: <IconSettings /> },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const alertCount = useAlertStore((s) => s.alerts.length);
  const items = ITEM_DEFS.map((i) => ({
    ...i,
    title: t(i.key),
    badge: i.href === "/app/settings" ? alertCount || undefined : undefined,
  }));
  return <BottomNavbar currentPath={pathname} primaryItems={items} />;
}
