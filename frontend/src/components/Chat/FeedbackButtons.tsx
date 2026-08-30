import { useState } from "react";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { IconThumbUp, IconThumbUpFilled, IconThumbDown, IconCheck } from "@tabler/icons-react";
import { Sheet, SheetContent, SheetTitle } from "@devalok/shilp-sutra/ui/sheet";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { useFeedbackStore } from "../../stores/feedbackStore";
import { useChatStore } from "../../stores/chatStore";

const REASONS = ["Wrong data", "Wrong location", "Hallucinated source", "Other"];

export function FeedbackButtons({ messageId, responseText, feedback }: { messageId: string; responseText: string; feedback?: "positive" | "negative" }) {
  const submit = useFeedbackStore((s) => s.submit);
  const setFeedback = useChatStore((s) => s.setFeedback);
  const [sheetOpen, setSheetOpen] = useState(false);

  async function pick(sentiment: "positive" | "negative", reason?: string) {
    setFeedback(messageId, sentiment);
    await submit(messageId, sentiment, responseText, reason);
    setSheetOpen(false);
    toast("Thanks, helps us improve accuracy");
  }

  return (
    <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.4rem" }}>
      <IconButton
        icon={feedback === "positive" ? <IconThumbUpFilled /> : <IconThumbUp />}
        variant="ghost" size="sm" color={feedback === "positive" ? "success" : "neutral"}
        aria-label="Good response"
        onClick={() => pick("positive")}
      />
      <IconButton
        icon={<IconThumbDown />}
        variant="ghost" size="sm" color={feedback === "negative" ? "error" : "neutral"}
        aria-label="Bad response"
        onClick={() => setSheetOpen(true)}
      />
      {feedback && <IconCheck size={14} style={{ alignSelf: "center", opacity: 0.5 }} />}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom">
          <SheetTitle>What went wrong?</SheetTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
            {REASONS.map((r) => (
              <Button key={r} variant="outline" size="sm" onClick={() => pick("negative", r)}>{r}</Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
