import { useState } from "react";
import { useTranslation } from "react-i18next";
import { postFeedback } from "../../lib/feedback";

const ISSUES = ["wrong_data", "wrong_location", "hallucinated", "other"] as const;

export function FeedbackButtons({ messageId, responseText, feedback }: {
  messageId: string; responseText: string; feedback?: "positive" | "negative";
}) {
  const { t } = useTranslation();
  const [state, setState]         = useState<"idle" | "bad_open" | "submitted">(feedback ? "submitted" : "idle");
  const [submitted, setSubmitted] = useState<"positive" | "negative" | null>(feedback ?? null);

  async function handleGood() {
    setState("submitted"); setSubmitted("positive");
    await postFeedback({ query_id: messageId, sentiment: "positive", reason: null, response_text: responseText });
  }

  async function handleIssue(issue: string) {
    setState("submitted"); setSubmitted("negative");
    await postFeedback({ query_id: messageId, sentiment: "negative", reason: issue, response_text: responseText });
  }

  if (state === "submitted") return (
    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
      {submitted === "positive" ? "👍" : "👎"} {t("feedback.thanks")}
    </span>
  );

  if (state === "bad_open") return (
    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t("feedback.title")}</span>
      {ISSUES.map((issue) => (
        <button
          key={issue}
          onClick={() => handleIssue(issue)}
          style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "0.2rem 0.6rem",
            color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem",
          }}
        >
          {t(`feedback.${issue}`)}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      <button
        onClick={handleGood} title={t("feedback.good")}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: "var(--text-muted)", padding: "0 2px" }}
      >👍</button>
      <button
        onClick={() => setState("bad_open")} title={t("feedback.bad")}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: "var(--text-muted)", padding: "0 2px" }}
      >👎</button>
    </div>
  );
}
