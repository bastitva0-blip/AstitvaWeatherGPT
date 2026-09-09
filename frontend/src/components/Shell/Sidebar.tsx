import { useNavigate, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/authStore";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, userName, userEmail } = useAuthStore();

  const sections = [
    {
      label: t("sidebar.analysis"),
      items: [
        { label: t("nav.climate"),        to: "/app/climate"       },
        { label: t("nav.crop_calendar"),  to: "/app/crop-calendar" },
        { label: t("nav.compare"),        to: "/app/compare"       },
        { label: t("nav.history"),        to: "/app/history"       },
        { label: t("sidebar.coverage"),   to: "/app/about"         },
      ],
    },
    {
      label: t("sidebar.developer_label"),
      items: [
        { label: t("nav.developer"), to: "/app/developer" },
        { label: t("nav.admin"),     to: "/app/admin"     },
      ],
    },
    {
      label: t("sidebar.account"),
      items: [
        { label: t("nav.settings"), to: "/app/settings" },
      ],
    },
  ];

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position:"fixed", inset:0, background:"rgba(2,11,20,0.7)", zIndex:40 }}
      />
      {/* Drawer */}
      <aside style={{
        position:"fixed", top:0, left:0, bottom:0, width:280,
        background:"var(--bg-surface)", zIndex:50,
        display:"flex", flexDirection:"column", overflowY:"auto",
        padding:"1.5rem 1rem",
      }}>
        {/* User info */}
        <div style={{ marginBottom:"1.5rem" }}>
          <p style={{ fontWeight:700, color:"var(--text-primary)", margin:0 }}>{userName}</p>
          <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", margin:0 }}>{userEmail}</p>
        </div>

        {sections.map((sec) => (
          <div key={sec.label} style={{ marginBottom:"1.25rem" }}>
            <p style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"1.5px", marginBottom:"0.5rem" }}>
              {sec.label.toUpperCase()}
            </p>
            {sec.items.map((item) => (
              <NavLink
                key={item.label} to={item.to}
                onClick={onClose}
                style={({ isActive }) => ({
                  display:"block", padding:"0.5rem 0.75rem", borderRadius:8,
                  color: isActive ? "var(--teal)" : "var(--text-primary)",
                  background: isActive ? "var(--teal-muted)" : "none",
                  textDecoration:"none", fontSize:"0.9rem", marginBottom:"0.15rem",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        {/* Sign out at bottom */}
        <div style={{ marginTop:"auto", paddingTop:"1rem", borderTop:"1px solid var(--border)" }}>
          <button
            onClick={() => { logout(); navigate("/"); onClose(); }}
            style={{
              width:"100%", padding:"0.6rem", borderRadius:8, cursor:"pointer",
              background:"none", border:"1px solid var(--border)",
              color:"var(--danger)", fontSize:"0.9rem", fontWeight:600,
            }}
          >
            {t("sidebar.sign_out")}
          </button>
        </div>
      </aside>
    </>
  );
}
