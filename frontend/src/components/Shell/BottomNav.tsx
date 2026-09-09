import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IconHome, IconMessage, IconMap, IconBuilding,
  IconBell, IconChartLine,
} from "@tabler/icons-react";

export function BottomNav() {
  const { t } = useTranslation();
  const items = [
    { to: "/app",         icon: IconHome,       label: t("nav.home")    },
    { to: "/app/chat",    icon: IconMessage,    label: t("nav.chat")    },
    { to: "/app/map",     icon: IconMap,        label: t("nav.map")     },
    { to: "/app/cities",  icon: IconBuilding,   label: t("nav.cities")  },
    { to: "/app/alerts",  icon: IconBell,       label: t("nav.alerts")  },
    { to: "/app/climate", icon: IconChartLine,  label: t("nav.climate") },
  ];
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to} to={to} end={to === "/app"}
          className={({ isActive }) => `bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`}
          aria-label={label}
        >
          <Icon size={22} aria-hidden="true" />
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
