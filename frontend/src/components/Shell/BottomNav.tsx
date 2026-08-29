import { useLocation } from "react-router-dom";
import { BottomNavbar } from "@devalok/shilp-sutra/shell/bottom-navbar";
import { IconHome, IconMessage, IconMap, IconMapPin, IconSettings } from "@tabler/icons-react";
import { useAlertStore } from "../../stores/alertStore";

const ITEMS = [
  { title: "Home", href: "/app", icon: <IconHome />, exact: true },
  { title: "Chat", href: "/app/chat", icon: <IconMessage /> },
  { title: "Map", href: "/app/map", icon: <IconMap /> },
  { title: "Cities", href: "/app/cities", icon: <IconMapPin /> },
  { title: "Settings", href: "/app/settings", icon: <IconSettings /> },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const alertCount = useAlertStore((s) => s.alerts.length);
  const items = ITEMS.map((i) => (i.href === "/app/settings" ? { ...i, badge: alertCount || undefined } : i));
  return <BottomNavbar currentPath={pathname} primaryItems={items} />;
}
