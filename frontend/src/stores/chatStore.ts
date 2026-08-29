import { create } from "zustand";
import type { QueryResponse } from "../lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: QueryResponse;
  feedback?: "positive" | "negative";
}

interface ChatState {
  sessionId: string;
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  setFeedback: (id: string, feedback: "positive" | "negative") => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: crypto.randomUUID(),
  messages: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setFeedback: (id, feedback) =>
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, feedback } : m)) })),
  clear: () => set({ messages: [] }),
}));
