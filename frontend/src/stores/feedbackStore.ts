import { create } from "zustand";
import { postFeedback } from "../lib/feedback";

interface FeedbackState {
  submitting: string | null;
  submitted: Record<string, "positive" | "negative">;
  submit: (queryId: string, sentiment: "positive" | "negative", responseText: string, reason?: string) => Promise<void>;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  submitting: null,
  submitted: {},
  submit: async (queryId, sentiment, responseText, reason) => {
    set({ submitting: queryId });
    try {
      await postFeedback({ query_id: queryId, sentiment, reason: reason ?? null, response_text: responseText });
      set((s) => ({ submitted: { ...s.submitted, [queryId]: sentiment } }));
    } finally {
      set({ submitting: null });
    }
  },
}));
