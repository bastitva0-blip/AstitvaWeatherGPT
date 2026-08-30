import { useLocation, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconHome, IconHomeFilled, IconMessage, IconMessageFilled,
         IconMap, IconMapPin, IconMapPinFilled,
         IconSettings, IconSettingsFilled } from "@tabler/icons-react";
import { useAlertStore } from "../../stores/alertStore";

// CHANGE 2: Custom BottomNav — filled icons on active, brighter teal accent,
// visible dot indicator that stands out on low-brightness displays.
// Shilp-sutra BottomNavbar uses subtle outlines; we override for contrast.

const ITEMS = [
  { key: "nav.home",     href: "/app",          exact: true,
    icon: <IconHome size={22} />,       iconActive: <IconHomeFilled size={22} /> },
  { key: "nav.chat",     href: "/app/chat",
    icon: <IconMessage size={22} />,    iconActive: <IconMessageFilled size={22} /> },
  { key: "nav.map",      href: "/app/map",
    icon: <IconMap size={22} />,        iconActive: <IconMap size={22} /> },
  { key: "nav.cities",   href: "/app/cities",
    icon: <IconMapPin size={22} />,     iconActive: <IconMapPinFilled size={22} /> },
  { key: "nav.settings", href: "/app/settings",
    icon: <IconSettings size={22} />,   iconActive: <IconSettingsFilled size={22} /> },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const alertCount = useAlertStore((s) => s.alerts.length);

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {ITEMS.map((item) => {
        const active = isActive(item.href, item.exact);
        const showBadge = item.key === "nav.settings" && alertCount > 0;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.exact}
            className={`bottom-nav__item${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="bottom-nav__icon-wrap" style={{ position: "relative" }}>
              {active ? item.iconActive : item.icon}
              {showBadge && (
                <span className="bottom-nav__badge" aria-label={`${alertCount} alerts`}>
                  {alertCount}
                </span>
              )}
            </span>
            <span className="bottom-nav__label">{t(item.key)}</span>
            {active && <span className="bottom-nav__pip" aria-hidden="true" />}
          </NavLink>
        );
      })}
    </nav>
  );
}
