import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "@devalok/shilp-sutra/shell";
import { useAuthStore } from "../../stores/authStore";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut, userName, userEmail } = useAuthStore();

  const sections = [
    {
      label: t("sidebar.analysis"),
      items: [
        { label: t("nav.climate"),       to: "/app/climate"       },
        { label: t("nav.crop_calendar"), to: "/app/crop-calendar" },
        { label: t("nav.compare"),       to: "/app/compare"       },
        { label: t("nav.history"),       to: "/app/history"       },
        { label: t("sidebar.coverage"),  to: "/app/about"         },
        { label: t("sidebar.about_team"),href: "/team"            },
      ],
    },
    {
      label: t("sidebar.developer_label"),
      items: [
        { label: t("nav.developer"),  to: "/app/developer" },
        { label: t("nav.admin"),      to: "/app/admin"     },
        { label: t("sidebar.api_docs"),  href: "/docs"     },
        { label: t("sidebar.github"),    href: "https://github.com" },
      ],
    },
    {
      label: t("sidebar.account"),
      items: [
        { label: t("nav.settings"), to: "/app/settings" },
        {
          label: t("sidebar.sign_out"),
          onClick: async () => { await signOut(); navigate("/"); onClose(); },
        },
      ],
    },
  ];

  return (
    <AppSidebar
      open={open} onClose={onClose}
      userName={userName || ""} userEmail={userEmail || ""}
      sections={sections.map((s) => ({
        label: s.label,
        items: s.items.map((item) => ({
          label: item.label,
          href: (item as any).href,
          to: (item as any).to,
          onClick: (item as any).onClick,
        })),
      }))}
    />
  );
}
