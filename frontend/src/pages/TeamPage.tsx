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
    did: "Set the architecture for Sanket and drove it from prototype to a deployed product. Rebuilt the entire frontend on the shilp-sutra design system, wired real Firebase authentication (Google and email) in place of the earlier mock login, integrated the Carto basemap for the live weather map, and manages the Railway deployment for both frontend and backend. Kept the team's individual pieces moving toward one shippable app.",
  },
  {
    name: "Harsh Tripathi",
    role: "NLP Engineer",
    photo: harsh,
    linkedin: "https://www.linkedin.com/in/aaharsh11z/",
    did: "Built the natural-language query pipeline that turns a plain-language question, in any of 17 supported languages, into a weather answer: language detection, intent classification, location extraction, and the logic that stitches together data from IMD, OWM, and Open-Meteo into one cited response.",
  },
  {
    name: "Ashish Prajapati",
    role: "Backend Engineer",
    photo: ashish,
    linkedin: "https://www.linkedin.com/in/ashish-kumar-prajapati-6b188937a/",
    did: "Built the FastAPI backend that every screen in the app calls into: the live weather and AQI routes, the crop advisory and METAR endpoints, the climate-trend archive lookup, and the alert subscription system. Designed the SQLAlchemy models (users, sessions, queries, alerts) that back all of it.",
  },
  {
    name: "Kulshreshtha Sharma",
    role: "Frontend Engineer",
    photo: kulshreshtha,
    linkedin: "https://www.linkedin.com/in/kulshrestha-sharma/",
    did: "Built out the core app shell screens people actually live in day to day: chat, the saved-cities list, the side-by-side city comparison view, and alert subscriptions, plus the shared UI components those screens are built from.",
  },
  {
    name: "Riya Mishra",
    role: "DevOps",
    photo: riya,
    linkedin: "https://www.linkedin.com/in/riya-mishra-94162b395/",
    did: "Set up the Docker builds and Kubernetes/monitoring configuration behind the app, and kept the CI/CD pipeline reliable so every push actually made it into a working build instead of a broken one.",
  },
  {
    name: "Anirudh Singh",
    role: "QA & Testing",
    photo: anirudh,
    linkedin: "https://www.linkedin.com/in/anirudh-singh-360621236/",
    did: "Ran the test suite and manual QA passes across the app, catching regressions in the voice input, the onboarding flow, and the alert subscription screen before they reached a build people could actually use.",
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
