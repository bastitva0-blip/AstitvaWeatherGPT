import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@devalok/shilp-sutra/ui/dialog";
import { IconBrandLinkedin, IconArrowLeft } from "@tabler/icons-react";
import astitva from "../assets/team/astitva.jpg";
import harsh from "../assets/team/harsh.jpg";
import ashish from "../assets/team/ashish.jpg";
import kulshreshtha from "../assets/team/kulshreshtha.jpg";
import riya from "../assets/team/riya.jpg";
import anirudh from "../assets/team/anirudh.jpg";

interface Member {
  name: string;
  role: string;
  photo: string;
  linkedin: string;
  did: string;
}

const TEAM: Member[] = [
  {
    name: "Astitva Bhardwaj",
    role: "Team Lead",
    photo: astitva,
    linkedin: "https://www.linkedin.com/in/astitva-bhardwajlu/",
    did: "Led the project end to end — architecture, the full frontend rebuild, Firebase auth, Carto map integration, Railway deployment, and coordinating the team's work into one shipped product.",
  },
  {
    name: "Harsh Tripathi",
    role: "NLP Engineer",
    photo: harsh,
    linkedin: "https://www.linkedin.com/in/aaharsh11z/",
    did: "Built the natural-language query pipeline — language detection, intent classification, and the multi-source weather answer generation that powers every chat response.",
  },
  {
    name: "Ashish Prajapati",
    role: "Backend Engineer",
    photo: ashish,
    linkedin: "https://www.linkedin.com/in/ashish-kumar-prajapati-6b188937a/",
    did: "Built the FastAPI backend — weather, AQI, agro, METAR, and climate-trend routes, the alert subscription system, and the database models behind them.",
  },
  {
    name: "Kulshreshtha Sharma",
    role: "Frontend Engineer",
    photo: kulshreshtha,
    linkedin: "https://www.linkedin.com/in/kulshrestha-sharma/",
    did: "Built out the app shell screens — chat, map, cities, compare, and alerts — and the shared UI components they run on.",
  },
  {
    name: "Riya Mishra",
    role: "DevOps",
    photo: riya,
    linkedin: "https://www.linkedin.com/in/riya-mishra-94162b395/",
    did: "Set up CI/CD, Docker, and the Kubernetes/monitoring stack, and kept the Railway deployments for frontend and backend running through the build.",
  },
  {
    name: "Anirudh Singh",
    role: "QA & Testing",
    photo: anirudh,
    linkedin: "https://www.linkedin.com/in/anirudh-singh-360621236/",
    did: "Owned the test suite and manual QA passes across the app, catching regressions in the voice input, alerts, and onboarding flows before ship.",
  },
];

export function TeamPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<Member | null>(null);

  return (
    <div className="landing" style={{ paddingTop: "2rem" }}>
      <Button variant="ghost" startIcon={<IconArrowLeft />} onClick={() => navigate(-1)} style={{ margin: "0 0 1rem 1.5rem" }}>
        Back
      </Button>
      <section className="section">
        <div className="section-eyebrow">Team Eloquence</div>
        <h2 className="section-headline">The people behind Sanket.</h2>
        <p className="section-body">Six of us, one SIH26068 build. Tap a card to see what each person actually shipped.</p>
        <div className="team-grid">
          {TEAM.map((m) => (
            <button key={m.name} className="team-card" onClick={() => setActive(m)}>
              <img src={m.photo} alt={m.name} className="team-card__photo" />
              <strong>{m.name}</strong>
              <span className="team-card__role">{m.role}</span>
            </button>
          ))}
        </div>
      </section>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent>
          {active && (
            <>
              <DialogTitle>{active.name}</DialogTitle>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.5rem" }}>
                <img src={active.photo} alt={active.name} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{active.role}</div>
                  <a href={active.linkedin} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--teal)", fontSize: "0.85rem" }}>
                    <IconBrandLinkedin size={16} /> LinkedIn
                  </a>
                </div>
              </div>
              <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>{active.did}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
