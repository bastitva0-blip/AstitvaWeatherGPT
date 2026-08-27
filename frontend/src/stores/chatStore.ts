import { create } from "zustand";
import type { QueryResponse } from "../lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: QueryResponse;
}

interface ChatState {
  sessionId: string;
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: crypto.randomUUID(),
  messages: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
}));
